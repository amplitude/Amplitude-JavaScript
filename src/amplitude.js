var Cookie = require('./cookie');
var JSON = require('json'); // jshint ignore:line
var language = require('./language');
var localStorage = require('./localstorage');  // jshint ignore:line
var md5 = require('JavaScript-MD5');
var object = require('object');
var Request = require('./xhr');
var UAParser = require('ua-parser-js');
var UUID = require('./uuid');
var version = require('./version');
var Identify = require('./identify');
var type = require('./type');

var log = function(s) {
  console.log('[Amplitude] ' + s);
};

var IDENTIFY_EVENT = '$identify';
var API_VERSION = 2;
var MAX_STRING_LENGTH = 1024;
var DEFAULT_OPTIONS = {
  apiEndpoint: 'api.amplitude.com',
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  domain: undefined,
  includeUtm: false,
  language: language.language,
  optOut: false,
  platform: 'Web',
  savedMaxCount: 1000,
  saveEvents: true,
  sessionTimeout: 30 * 60 * 1000,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100,
  batchEvents: false,
  eventUploadThreshold: 30,
  eventUploadPeriodMillis: 30 * 1000 // 30s
};
var LocalStorageKeys = {
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_IDENTIFY_ID: 'amplitude_lastIdentifyId',
  LAST_SEQUENCE_NUMBER: 'amplitude_lastSequenceNumber',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  SESSION_ID: 'amplitude_sessionId',

  DEVICE_ID: 'amplitude_deviceId',
  USER_ID: 'amplitude_userId',
  OPT_OUT: 'amplitude_optOut',

  INITIAL_REFERRER: 'amplitude_initialReferrer'
};

/*
 * Amplitude API
 */
var Amplitude = function() {
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = object.merge({}, DEFAULT_OPTIONS);
  this._q = []; // queue for proxied functions before script load
};

Amplitude.prototype._eventId = 0;
Amplitude.prototype._identifyId = 0;
Amplitude.prototype._sequenceNumber = 0;
Amplitude.prototype._sending = false;
Amplitude.prototype._lastEventTime = null;
Amplitude.prototype._sessionId = null;
Amplitude.prototype._newSession = false;
Amplitude.prototype._updateScheduled = false;

Amplitude.prototype.Identify = Identify;

/**
 * Initializes Amplitude.
 * apiKey The API Key for your app
 * opt_userId An identifier for this user
 * opt_config Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 *   - includeUtm (boolean) Whether to send utm parameters with events. Defaults to false.
 *   - includeReferrer (boolean) Whether to send referrer info with events. Defaults to false.
 */
Amplitude.prototype.init = function(apiKey, opt_userId, opt_config, callback) {
  try {
    this.options.apiKey = apiKey;
    if (opt_config) {
      if (opt_config.saveEvents !== undefined) {
        this.options.saveEvents = !!opt_config.saveEvents;
      }
      if (opt_config.domain !== undefined) {
        this.options.domain = opt_config.domain;
      }
      if (opt_config.includeUtm !== undefined) {
        this.options.includeUtm = !!opt_config.includeUtm;
      }
      if (opt_config.includeReferrer !== undefined) {
        this.options.includeReferrer = !!opt_config.includeReferrer;
      }
      if (opt_config.batchEvents !== undefined) {
        this.options.batchEvents = !!opt_config.batchEvents;
      }
      this.options.platform = opt_config.platform || this.options.platform;
      this.options.language = opt_config.language || this.options.language;
      this.options.sessionTimeout = opt_config.sessionTimeout || this.options.sessionTimeout;
      this.options.uploadBatchSize = opt_config.uploadBatchSize || this.options.uploadBatchSize;
      this.options.eventUploadThreshold = opt_config.eventUploadThreshold || this.options.eventUploadThreshold;
      this.options.savedMaxCount = opt_config.savedMaxCount || this.options.savedMaxCount;
      this.options.eventUploadPeriodMillis = opt_config.eventUploadPeriodMillis || this.options.eventUploadPeriodMillis;
    }

    Cookie.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = Cookie.options().domain;

    _migrateLocalStorageDataToCookie(this);
    _loadCookieData(this);

    this.options.deviceId = (opt_config && opt_config.deviceId !== undefined &&
        opt_config.deviceId !== null && opt_config.deviceId) ||
        this.options.deviceId || UUID();
    this.options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || this.options.userId || null;
    _saveCookieData(this);

    //log('initialized with apiKey=' + apiKey);
    //opt_userId !== undefined && opt_userId !== null && log('initialized with userId=' + opt_userId);

    if (this.options.saveEvents) {
      this._loadSavedUnsentEvents(this.options.unsentKey, '_unsentEvents');
      this._loadSavedUnsentEvents(this.options.unsentIdentifyKey, '_unsentIdentifys');
    }

    this._sendEventsIfReady();

    if (this.options.includeUtm) {
      this._initUtmData();
    }

    if (this.options.includeReferrer) {
      this._saveInitialReferrer(document.referrer);
    }

    this._lastEventTime = parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
    this._sessionId = parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
    this._eventId = localStorage.getItem(LocalStorageKeys.LAST_EVENT_ID) || 0;
    this._identifyId = localStorage.getItem(LocalStorageKeys.LAST_IDENTIFY_ID) || 0;
    this._sequenceNumber = localStorage.getItem(LocalStorageKeys.LAST_SEQUENCE_NUMBER) || 0;
    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      this._newSession = true;
      this._sessionId = now;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, this._sessionId);
    }
    this._lastEventTime = now;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, this._lastEventTime);
  } catch (e) {
    log(e);
  }

  if (callback && type(callback) === 'function') {
    callback();
  }
};

Amplitude.prototype.runQueuedFunctions = function () {
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (fn && type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running
};

Amplitude.prototype._loadSavedUnsentEvents = function(unsentKey, queue) {
  var savedUnsentEventsString = localStorage.getItem(unsentKey);
  if (savedUnsentEventsString) {
    try {
      this[queue] = JSON.parse(savedUnsentEventsString);
    } catch (e) {
      //log(e);
    }
  }
};

Amplitude.prototype.isNewSession = function() {
  return this._newSession;
};

Amplitude.prototype.nextEventId = function() {
  this._eventId++;
  return this._eventId;
};

Amplitude.prototype.nextIdentifyId = function() {
  this._identifyId++;
  return this._identifyId;
};

Amplitude.prototype.nextSequenceNumber = function() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

// returns the number of unsent events and identifys
Amplitude.prototype._unsentCount = function() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

// returns true if sendEvents called immediately
Amplitude.prototype._sendEventsIfReady = function(callback) {
  if (this._unsentCount() === 0) {
    return false;
  }

  if (!this.options.batchEvents) {
    this.sendEvents(callback);
    return true;
  }

  if (this._unsentCount() >= this.options.eventUploadThreshold) {
    this.sendEvents(callback);
    return true;
  }

  if (!this._updateScheduled) {
    this._updateScheduled = true;
    setTimeout(
      function() {
        this._updateScheduled = false;
        this.sendEvents();
      }.bind(this), this.options.eventUploadPeriodMillis
    );
  }

  return false;
};

var _migrateLocalStorageDataToCookie = function(scope) {
  var cookieData = Cookie.get(scope.options.cookieName);
  if (cookieData && cookieData.deviceId) {
    return; // migration not needed
  }

  var cookieDeviceId = (cookieData && cookieData.deviceId) || null;
  var cookieUserId = (cookieData && cookieData.userId) || null;
  var cookieOptOut = (cookieData && cookieData.optOut !== null && cookieData.optOut !== undefined) ?
      cookieData.optOut : null;

  var keySuffix = '_' + scope.options.apiKey.slice(0, 6);
  var localStorageDeviceId = localStorage.getItem(LocalStorageKeys.DEVICE_ID + keySuffix);
  if (localStorageDeviceId) {
    localStorage.removeItem(LocalStorageKeys.DEVICE_ID + keySuffix);
  }
  var localStorageUserId = localStorage.getItem(LocalStorageKeys.USER_ID + keySuffix);
  if (localStorageUserId) {
    localStorage.removeItem(LocalStorageKeys.USER_ID + keySuffix);
  }
  var localStorageOptOut = localStorage.getItem(LocalStorageKeys.OPT_OUT + keySuffix);
  if (localStorageOptOut !== null && localStorageOptOut !== undefined) {
    localStorage.removeItem(LocalStorageKeys.OPT_OUT + keySuffix);
    localStorageOptOut = String(localStorageOptOut) === 'true'; // convert to boolean
  }

  Cookie.set(scope.options.cookieName, {
    deviceId: cookieDeviceId || localStorageDeviceId,
    userId: cookieUserId || localStorageUserId,
    optOut: (cookieOptOut !== undefined && cookieOptOut !== null) ? cookieOptOut : localStorageOptOut
  });
};

var _loadCookieData = function(scope) {
  var cookieData = Cookie.get(scope.options.cookieName);
  if (cookieData) {
    if (cookieData.deviceId) {
      scope.options.deviceId = cookieData.deviceId;
    }
    if (cookieData.userId) {
      scope.options.userId = cookieData.userId;
    }
    if (cookieData.optOut !== null && cookieData.optOut !== undefined) {
      scope.options.optOut = cookieData.optOut;
    }
  }
};

var _saveCookieData = function(scope) {
  Cookie.set(scope.options.cookieName, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    optOut: scope.options.optOut
  });
};

Amplitude._getUtmParam = function(name, query) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(query);
  return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
};

Amplitude._getUtmData = function(rawCookie, query) {
  // Translate the utmz cookie format into url query string format.
  var cookie = rawCookie ? '?' + rawCookie.split('.').slice(-1)[0].replace(/\|/g, '&') : '';

  var fetchParam = function (queryName, query, cookieName, cookie) {
    return Amplitude._getUtmParam(queryName, query) ||
           Amplitude._getUtmParam(cookieName, cookie);
  };

  return {
    utm_source: fetchParam('utm_source', query, 'utmcsr', cookie),
    utm_medium: fetchParam('utm_medium', query, 'utmcmd', cookie),
    utm_campaign: fetchParam('utm_campaign', query, 'utmccn', cookie),
    utm_term: fetchParam('utm_term', query, 'utmctr', cookie),
    utm_content: fetchParam('utm_content', query, 'utmcct', cookie),
  };
};

/**
 * Parse the utm properties out of cookies and query for adding to user properties.
 */
Amplitude.prototype._initUtmData = function(queryParams, cookieParams) {
  queryParams = queryParams || location.search;
  cookieParams = cookieParams || Cookie.get('__utmz');
  this._utmProperties = Amplitude._getUtmData(cookieParams, queryParams);
};

Amplitude.prototype._getReferrer = function() {
  return document.referrer;
};

Amplitude.prototype._getReferringDomain = function(referrer) {
  var parts = referrer.split('/');
  if (parts.length >= 3) {
    return parts[2];
  }
  return '';
};

Amplitude.prototype._saveInitialReferrer = function(initialReferrer) {
  if (initialReferrer === '') {
    return;
  }
  var hasSessionStorage = window.sessionStorage ? true : false;
  if (hasSessionStorage && !window.sessionStorage.getItem(LocalStorageKeys.INITIAL_REFERRER)) {
    window.sessionStorage.setItem(LocalStorageKeys.INITIAL_REFERRER, initialReferrer);
  }
};

Amplitude.prototype._getInitialReferrer = function() {
  var hasSessionStorage = window.sessionStorage ? true : false;
  if (hasSessionStorage) {
    return window.sessionStorage.getItem(LocalStorageKeys.INITIAL_REFERRER) || '';
  }
  return '';
};

Amplitude.prototype.saveEvents = function() {
  try {
    localStorage.setItem(this.options.unsentKey, JSON.stringify(this._unsentEvents));
    localStorage.setItem(this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
  } catch (e) {
    //log(e);
  }
};

Amplitude.prototype.setDomain = function(domain) {
  try {
    Cookie.options({
      domain: domain
    });
    this.options.domain = Cookie.options().domain;
    _loadCookieData(this);
    _saveCookieData(this);
    //log('set domain=' + domain);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setUserId = function(userId) {
  try {
    this.options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    _saveCookieData(this);
    //log('set userId=' + userId);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setOptOut = function(enable) {
  try {
    this.options.optOut = enable;
    _saveCookieData(this);
    //log('set optOut=' + enable);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setDeviceId = function(deviceId) {
  try {
    if (deviceId) {
      this.options.deviceId = ('' + deviceId);
      _saveCookieData(this);
    }
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setUserProperties = function(userProperties) {
  // convert userProperties into an identify call
  var identify = new Identify();
  for (var property in userProperties) {
    if (userProperties.hasOwnProperty(property)) {
      identify.set(property, userProperties[property]);
    }
  }
  this.identify(identify);
};

Amplitude.prototype.identify = function(identify) {

  if (type(identify) === 'object' && '_q' in identify) {
    var instance = new Identify();
    // Apply the queued commands
    for (var i = 0; i < identify._q.length; i++) {
        var fn = instance[identify._q[i][0]];
        if (fn && type(fn) === 'function') {
          fn.apply(instance, identify._q[i].slice(1));
        }
    }
    identify = instance;
  }

  if (identify instanceof Identify && Object.keys(identify.userPropertiesOperations).length > 0) {
    this._logEvent(IDENTIFY_EVENT, null, null, identify.userPropertiesOperations);
  }
};

Amplitude.prototype.setVersionName = function(versionName) {
  try {
    this.options.versionName = versionName;
    //log('set versionName=' + versionName);
  } catch (e) {
    log(e);
  }
};

// truncate string values in event and user properties so that request size does not get too large
Amplitude.prototype._truncate = function(value) {
  if (type(value) === 'array') {
    for (var i = 0; i < value.length; i++) {
      value[i] = this._truncate(value[i]);
    }
  } else if (type(value) === 'object') {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        value[key] = this._truncate(value[key]);
      }
    }
  } else {
    value = _truncateValue(value);
  }

  return value;
};

var _truncateValue = function(value) {
  if (type(value) === 'string') {
    return value.length > MAX_STRING_LENGTH ? value.substring(0, MAX_STRING_LENGTH) : value;
  }
  return value;
};

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 */
Amplitude.prototype._logEvent = function(eventType, eventProperties, apiProperties, userProperties, callback) {
  if (type(callback) !== 'function') {
    callback = null;
  }

  if (!eventType || this.options.optOut) {
    if (callback) {
      callback(0, 'No request sent');
    }
    return;
  }
  try {
    var eventId;
    if (eventType === IDENTIFY_EVENT) {
      eventId = this.nextIdentifyId();
      localStorage.setItem(LocalStorageKeys.LAST_IDENTIFY_ID, eventId);
    } else {
      eventId = this.nextEventId();
      localStorage.setItem(LocalStorageKeys.LAST_EVENT_ID, eventId);
    }
    var eventTime = new Date().getTime();
    var ua = this._ua;
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, this._sessionId);
    }
    this._lastEventTime = eventTime;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, this._lastEventTime);

    userProperties = userProperties || {};
    // Only add utm properties to user properties for events
    if (eventType !== IDENTIFY_EVENT) {
      object.merge(userProperties, this._utmProperties);

      // Add referral info onto the user properties
      if (this.options.includeReferrer) {
        var referrer = this._getReferrer();
        var initialReferrer = this._getInitialReferrer();
        object.merge(userProperties, {
          'referrer': referrer,
          'referring_domain': this._getReferringDomain(referrer),
          'initial_referrer': initialReferrer,
          'initial_referring_domain': this._getReferringDomain(initialReferrer)
        });
      }
    }

    apiProperties = apiProperties || {};
    eventProperties = eventProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId || this.options.deviceId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: this._sessionId || -1,
      event_type: eventType,
      version_name: this.options.versionName || null,
      platform: this.options.platform,
      os_name: ua.browser.name || null,
      os_version: ua.browser.major || null,
      device_model: ua.os.name || null,
      language: this.options.language,
      api_properties: apiProperties,
      event_properties: this._truncate(eventProperties),
      user_properties: this._truncate(userProperties),
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: this.__VERSION__
      },
      sequence_number: this.nextSequenceNumber() // for ordering events and identifys
      // country: null
    };

    if (eventType === IDENTIFY_EVENT) {
      this._unsentIdentifys.push(event);
      this._limitEventsQueued(this._unsentIdentifys);
    } else {
      this._unsentEvents.push(event);
      this._limitEventsQueued(this._unsentEvents);
    }

    if (this.options.saveEvents) {
      this.saveEvents();
    }

    if (!this._sendEventsIfReady(callback) && callback) {
      callback(0, 'No request sent');
    }

    return eventId;
  } catch (e) {
    log(e);
  }
};

// Remove old events from the beginning of the array if too many
// have accumulated. Don't want to kill memory. Default is 1000 events.
Amplitude.prototype._limitEventsQueued = function(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};

Amplitude.prototype.logEvent = function(eventType, eventProperties, callback) {
  return this._logEvent(eventType, eventProperties, null, null, callback);
};

// Test that n is a number or a numeric value.
var _isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

Amplitude.prototype.logRevenue = function(price, quantity, product) {
  // Test that the parameters are of the right type.
  if (!_isNumber(price) || quantity !== undefined && !_isNumber(quantity)) {
    // log('Price and quantity arguments to logRevenue must be numbers');
    return;
  }

  return this._logEvent('revenue_amount', {}, {
    productId: product,
    special: 'revenue_amount',
    quantity: quantity || 1,
    price: price
  });
};

/**
 * Remove events in storage with event ids up to and including maxEventId. Does
 * a true filter in case events get out of order or old events are removed.
 */
Amplitude.prototype.removeEvents = function (maxEventId, maxIdentifyId) {
  if (maxEventId >= 0) {
    var filteredEvents = [];
    for (var i = 0; i < this._unsentEvents.length; i++) {
      if (this._unsentEvents[i].event_id > maxEventId) {
        filteredEvents.push(this._unsentEvents[i]);
      }
    }
    this._unsentEvents = filteredEvents;
  }

  if (maxIdentifyId >= 0) {
    var filteredIdentifys = [];
    for (var j = 0; j < this._unsentIdentifys.length; j++) {
      if (this._unsentIdentifys[j].event_id > maxIdentifyId) {
        filteredIdentifys.push(this._unsentIdentifys[j]);
      }
    }
    this._unsentIdentifys = filteredIdentifys;
  }
};

Amplitude.prototype.sendEvents = function(callback) {
  if (!this._sending && !this.options.optOut && this._unsentCount() > 0) {
    this._sending = true;
    var url = ('https:' === window.location.protocol ? 'https' : 'http') + '://' +
        this.options.apiEndpoint + '/';

    // fetch events to send
    var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);
    var mergedEvents = this._mergeEventsAndIdentifys(numEvents);
    var maxEventId = mergedEvents.maxEventId;
    var maxIdentifyId = mergedEvents.maxIdentifyId;
    var events = JSON.stringify(mergedEvents.eventsToSend);

    var uploadTime = new Date().getTime();
    var data = {
      client: this.options.apiKey,
      e: events,
      v: API_VERSION,
      upload_time: uploadTime,
      checksum: md5(API_VERSION + this.options.apiKey + events + uploadTime)
    };

    var scope = this;
    new Request(url, data).send(function(status, response) {
      scope._sending = false;
      try {
        if (status === 200 && response === 'success') {
          //log('sucessful upload');
          scope.removeEvents(maxEventId, maxIdentifyId);

          // Update the event cache after the removal of sent events.
          if (scope.options.saveEvents) {
            scope.saveEvents();
          }

          // Send more events if any queued during previous send.
          if (!scope._sendEventsIfReady(callback) && callback) {
            callback(status, response);
          }

        } else if (status === 413) {
          //log('request too large');
          // Can't even get this one massive event through. Drop it.
          if (scope.options.uploadBatchSize === 1) {
            // if massive event is identify, still need to drop it
            scope.removeEvents(maxEventId, maxIdentifyId);
          }

          // The server complained about the length of the request.
          // Backoff and try again.
          scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
          scope.sendEvents(callback);

        } else if (callback) { // If server turns something like a 400
          callback(status, response);
        }
      } catch (e) {
        //log('failed upload');
      }
    });
  } else if (callback) {
    callback(0, 'No request sent');
  }
};

Amplitude.prototype._mergeEventsAndIdentifys = function(numEvents) {
  // coalesce events from both queues
  var eventsToSend = [];
  var eventIndex = 0;
  var maxEventId = -1;
  var identifyIndex = 0;
  var maxIdentifyId = -1;

  while (eventsToSend.length < numEvents) {
    var event;

    // case 1: no identifys - grab from events
    if (identifyIndex >= this._unsentIdentifys.length) {
      event = this._unsentEvents[eventIndex++];
      maxEventId = event.event_id;

    // case 2: no events - grab from identifys
    } else if (eventIndex >= this._unsentEvents.length) {
      event = this._unsentIdentifys[identifyIndex++];
      maxIdentifyId = event.event_id;

    // case 3: need to compare sequence numbers
    } else {
      // events logged before v2.5.0 won't have a sequence number, put those first
      if (!('sequence_number' in this._unsentEvents[eventIndex]) ||
          this._unsentEvents[eventIndex].sequence_number <
          this._unsentIdentifys[identifyIndex].sequence_number) {
        event = this._unsentEvents[eventIndex++];
        maxEventId = event.event_id;
      } else {
        event = this._unsentIdentifys[identifyIndex++];
        maxIdentifyId = event.event_id;
      }
    }

    eventsToSend.push(event);
  }

  return {
    eventsToSend: eventsToSend,
    maxEventId: maxEventId,
    maxIdentifyId: maxIdentifyId
  };
};

/**
 *  @deprecated
 */
Amplitude.prototype.setGlobalUserProperties = Amplitude.prototype.setUserProperties;

Amplitude.prototype.__VERSION__ = version;

module.exports = Amplitude;
