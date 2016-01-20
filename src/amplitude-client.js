var cookieStorage = require('./cookiestorage');
var getUtmData = require('./utm');
var Identify = require('./identify');
var JSON = require('json'); // jshint ignore:line
var language = require('./language');
var localStorage = require('./localstorage');  // jshint ignore:line
var md5 = require('JavaScript-MD5');
var object = require('object');
var Request = require('./xhr');
var UAParser = require('ua-parser-js');
var UUID = require('./uuid');
var version = require('./version');
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
  REFERRER: 'amplitude_referrer',

  // Used in cookie as well
  DEVICE_ID: 'amplitude_deviceId',
  USER_ID: 'amplitude_userId',
  OPT_OUT: 'amplitude_optOut'
};

/*
 * AmplitudeClient API
 */
var AmplitudeClient = function() {
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = object.merge({}, DEFAULT_OPTIONS);
  this.cookieStorage = new cookieStorage().getStorage();
  this._q = []; // queue for proxied functions before script load
};

AmplitudeClient.prototype._eventId = 0;
AmplitudeClient.prototype._identifyId = 0;
AmplitudeClient.prototype._sequenceNumber = 0;
AmplitudeClient.prototype._sending = false;
AmplitudeClient.prototype._lastEventTime = null;
AmplitudeClient.prototype._sessionId = null;
AmplitudeClient.prototype._newSession = false;
AmplitudeClient.prototype._updateScheduled = false;

/* MOVE THIS */
AmplitudeClient.prototype.Identify = Identify;

/**
 * Initializes AmplitudeClient.
 * apiKey The API Key for your app
 * opt_userId An identifier for this user
 * opt_config Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 *   - includeUtm (boolean) Whether to send utm parameters with events. Defaults to false.
 *   - includeReferrer (boolean) Whether to send referrer info with events. Defaults to false.
 */
AmplitudeClient.prototype.init = function(apiKey, opt_userId, opt_config, callback) {
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

    /* NEED TO MIGRATE AND FIX THIS */
    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = this.cookieStorage.options().domain;

    _migrateLocalStorageDataToCookie(this);
    _loadCookieData(this);

    /* DEVICE ID WILL BE DIFFERENT ACROSS APPS */
    this.options.deviceId = (opt_config && opt_config.deviceId !== undefined &&
        opt_config.deviceId !== null && opt_config.deviceId) ||
        this.options.deviceId || UUID();
    this.options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || this.options.userId || null;

    /* MIGRATE LOCAL STORAGE KEYS? */
    this._lastEventTime = this._lastEventTime || parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
    this._sessionId = this._sessionId || parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
    this._eventId = this._eventId || parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_ID)) || 0;
    this._identifyId = this._identifyId || parseInt(localStorage.getItem(LocalStorageKeys.LAST_IDENTIFY_ID)) || 0;
    this._sequenceNumber = this._sequenceNumber || parseInt(localStorage.getItem(LocalStorageKeys.LAST_SEQUENCE_NUMBER)) || 0;
    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      this._newSession = true;
      this._sessionId = now;
    }
    this._lastEventTime = now;
    _saveCookieData(this);
    _clearSessionAndEventTrackingFromLocalStorage();

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
      this._saveReferrer(this._getReferrer());
    }
  } catch (e) {
    log(e);
  }

  if (callback && type(callback) === 'function') {
    callback();
  }
};

/* DOES THIS HAPPEN ON AMPLITUDE INSTEAD OF AMPLITUDECLIENT? */
AmplitudeClient.prototype.runQueuedFunctions = function () {
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (fn && type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running
};

AmplitudeClient.prototype._loadSavedUnsentEvents = function(unsentKey, queue) {
  var savedUnsentEventsString = localStorage.getItem(unsentKey);
  if (savedUnsentEventsString) {
    try {
      this[queue] = JSON.parse(savedUnsentEventsString);
    } catch (e) {
      //log(e);
    }
  }
};

AmplitudeClient.prototype.isNewSession = function() {
  return this._newSession;
};

AmplitudeClient.prototype.getSessionId = function() {
  return this._sessionId;
};

AmplitudeClient.prototype.nextEventId = function() {
  this._eventId++;
  return this._eventId;
};

AmplitudeClient.prototype.nextIdentifyId = function() {
  this._identifyId++;
  return this._identifyId;
};

AmplitudeClient.prototype.nextSequenceNumber = function() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

// returns the number of unsent events and identifys
AmplitudeClient.prototype._unsentCount = function() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

// returns true if sendEvents called immediately
AmplitudeClient.prototype._sendEventsIfReady = function(callback) {
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

// backwards migration fix for users that upgraded to broken v2.6.0
var _migrateLocalStorageDataToCookie = function(scope) {
  var cookieData = scope.cookieStorage.get(scope.options.cookieName);
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

  scope.cookieStorage.set(scope.options.cookieName, {
    deviceId: cookieDeviceId || localStorageDeviceId,
    userId: cookieUserId || localStorageUserId,
    optOut: (cookieOptOut !== undefined && cookieOptOut !== null) ? cookieOptOut : localStorageOptOut
  });
};

var _loadCookieData = function(scope) {
  var cookieData = scope.cookieStorage.get(scope.options.cookieName);
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
    if (cookieData.sessionId) {
      scope._sessionId = parseInt(cookieData.sessionId);
    }
    if (cookieData.lastEventTime) {
      scope._lastEventTime = parseInt(cookieData.lastEventTime);
    }
    if (cookieData.eventId) {
      scope._eventId = parseInt(cookieData.eventId);
    }
    if (cookieData.identifyId) {
      scope._identifyId = parseInt(cookieData.identifyId);
    }
    if (cookieData.sequenceNumber) {
      scope._sequenceNumber = parseInt(cookieData.sequenceNumber);
    }
  }
};

var _saveCookieData = function(scope) {
  scope.cookieStorage.set(scope.options.cookieName, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    optOut: scope.options.optOut,
    sessionId: scope._sessionId,
    lastEventTime: scope._lastEventTime,
    eventId: scope._eventId,
    identifyId: scope._identifyId,
    sequenceNumber: scope._sequenceNumber
  });
};

// the follow fields used to be saved in localStorage, now saved in cookie to support different subdomains
var _clearSessionAndEventTrackingFromLocalStorage = function() {
  localStorage.removeItem(LocalStorageKeys.SESSION_ID);
  localStorage.removeItem(LocalStorageKeys.LAST_EVENT_TIME);
  localStorage.removeItem(LocalStorageKeys.LAST_EVENT_ID);
  localStorage.removeItem(LocalStorageKeys.LAST_IDENTIFY_ID);
  localStorage.removeItem(LocalStorageKeys.LAST_SEQUENCE_NUMBER);
};



/**
 * Parse the utm properties out of cookies and query for adding to user properties.
 */
AmplitudeClient.prototype._initUtmData = function(queryParams, cookieParams) {
  queryParams = queryParams || location.search;
  cookieParams = cookieParams || this.cookieStorage.get('__utmz');
  this._utmProperties = getUtmData(cookieParams, queryParams);
};

AmplitudeClient.prototype._getReferrer = function() {
  return document.referrer;
};

AmplitudeClient.prototype._getReferringDomain = function(referrer) {
  if (referrer === null || referrer === undefined || referrer === '') {
    return null;
  }
  var parts = referrer.split('/');
  if (parts.length >= 3) {
    return parts[2];
  }
  return null;
};

// since user properties are propagated on the server, only send once per session, don't need to send with every event
AmplitudeClient.prototype._saveReferrer = function(referrer) {
  if (referrer === null || referrer === undefined || referrer === '') {
    return;
  }

  // always setOnce initial referrer
  var referring_domain = this._getReferringDomain(referrer);
  var identify = new Identify().setOnce('initial_referrer', referrer);
  identify.setOnce('initial_referring_domain', referring_domain);

  // only save referrer if not already in session storage or if storage disabled
  var hasSessionStorage = window.sessionStorage ? true : false;
  if ((hasSessionStorage && !window.sessionStorage.getItem(LocalStorageKeys.REFERRER)) || !hasSessionStorage) {
    identify.set('referrer', referrer).set('referring_domain', referring_domain);

    if (hasSessionStorage) {
      window.sessionStorage.setItem(LocalStorageKeys.REFERRER, referrer);
    }
  }

  this.identify(identify);
};

AmplitudeClient.prototype.saveEvents = function() {
  try {
    localStorage.setItem(this.options.unsentKey, JSON.stringify(this._unsentEvents));
    localStorage.setItem(this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
  } catch (e) {
    //log(e);
  }
};

AmplitudeClient.prototype.setDomain = function(domain) {
  try {
    this.cookieStorage.options({
      domain: domain
    });
    this.options.domain = this.cookieStorage.options().domain;
    _loadCookieData(this);
    _saveCookieData(this);
    //log('set domain=' + domain);
  } catch (e) {
    log(e);
  }
};

AmplitudeClient.prototype.setUserId = function(userId) {
  try {
    this.options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    _saveCookieData(this);
    //log('set userId=' + userId);
  } catch (e) {
    log(e);
  }
};

AmplitudeClient.prototype.setOptOut = function(enable) {
  try {
    this.options.optOut = enable;
    _saveCookieData(this);
    //log('set optOut=' + enable);
  } catch (e) {
    log(e);
  }
};

AmplitudeClient.prototype.setDeviceId = function(deviceId) {
  try {
    if (deviceId) {
      this.options.deviceId = ('' + deviceId);
      _saveCookieData(this);
    }
  } catch (e) {
    log(e);
  }
};

AmplitudeClient.prototype.setUserProperties = function(userProperties) {
  // convert userProperties into an identify call
  var identify = new Identify();
  for (var property in userProperties) {
    if (userProperties.hasOwnProperty(property)) {
      identify.set(property, userProperties[property]);
    }
  }
  this.identify(identify);
};

// Clearing user properties is irreversible!
AmplitudeClient.prototype.clearUserProperties = function(){
  var identify = new Identify();
  identify.clearAll();
  this.identify(identify);
};

AmplitudeClient.prototype.identify = function(identify) {

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

AmplitudeClient.prototype.setVersionName = function(versionName) {
  try {
    this.options.versionName = versionName;
    //log('set versionName=' + versionName);
  } catch (e) {
    log(e);
  }
};

// truncate string values in event and user properties so that request size does not get too large
AmplitudeClient.prototype._truncate = function(value) {
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
AmplitudeClient.prototype._logEvent = function(eventType, eventProperties, apiProperties, userProperties, callback) {
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
    } else {
      eventId = this.nextEventId();
    }
    var sequenceNumber = this.nextSequenceNumber();
    var eventTime = new Date().getTime();
    var ua = this._ua;
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }
    this._lastEventTime = eventTime;
    _saveCookieData(this);

    userProperties = userProperties || {};
    // Only add utm properties to user properties for events
    if (eventType !== IDENTIFY_EVENT) {
      object.merge(userProperties, this._utmProperties);
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
        version: version
      },
      sequence_number: sequenceNumber // for ordering events and identifys
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
AmplitudeClient.prototype._limitEventsQueued = function(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};

AmplitudeClient.prototype.logEvent = function(eventType, eventProperties, callback) {
  return this._logEvent(eventType, eventProperties, null, null, callback);
};

// Test that n is a number or a numeric value.
var _isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

AmplitudeClient.prototype.logRevenue = function(price, quantity, product) {
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
AmplitudeClient.prototype.removeEvents = function (maxEventId, maxIdentifyId) {
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

AmplitudeClient.prototype.sendEvents = function(callback) {
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

AmplitudeClient.prototype._mergeEventsAndIdentifys = function(numEvents) {
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

module.exports = AmplitudeClient;
