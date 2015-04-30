var Cookie = require('./cookie');
var JSON = require('json'); // jshint ignore:line
var language = require('./language');
var localStorage = require('./localstorage');  // jshint ignore:line
var md5 = require('./md5');
var object = require('object');
var Request = require('./xhr');
var UAParser = require('ua-parser-js');
var UUID = require('./uuid');
var version = require('./version');

var log = function(s) {
  console.log('[Amplitude] ' + s);
};

var API_VERSION = 2;
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
  uploadBatchSize: 100,
};
var LocalStorageKeys = {
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  SESSION_ID: 'amplitude_sessionId'
};

/*
 * Amplitude API
 */
var Amplitude = function() {
  this._unsentEvents = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = object.merge({}, DEFAULT_OPTIONS);
};


Amplitude.prototype._eventId = 0;
Amplitude.prototype._sending = false;
Amplitude.prototype._lastEventTime = null;
Amplitude.prototype._sessionId = null;
Amplitude.prototype._newSession = false;

/**
 * Initializes Amplitude.
 * apiKey The API Key for your app
 * opt_userId An identifier for this user
 * opt_config Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 *   - includeUtm (boolean) Whether to send utm parameters with events. Defaults to false.
 */
Amplitude.prototype.init = function(apiKey, opt_userId, opt_config) {
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
      this.options.platform = opt_config.platform || this.options.platform;
      this.options.language = opt_config.language || this.options.language;
      this.options.sessionTimeout = opt_config.sessionTimeout || this.options.sessionTimeout;
      this.options.uploadBatchSize = opt_config.uploadBatchSize || this.options.uploadBatchSize;
      this.options.savedMaxCount = opt_config.savedMaxCount || this.options.savedMaxCount;
    }

    Cookie.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = Cookie.options().domain;

    _loadCookieData(this);

    this.options.deviceId = (opt_config && opt_config.deviceId !== undefined &&
        opt_config.deviceId !== null && opt_config.deviceId) ||
        this.options.deviceId || UUID();
    this.options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || this.options.userId || null;
    _saveCookieData(this);

    //log('initialized with apiKey=' + apiKey);
    //opt_userId !== undefined && opt_userId !== null && log('initialized with userId=' + opt_userId);

    if (this.options.saveEvents) {
      var savedUnsentEventsString = localStorage.getItem(this.options.unsentKey);
      if (savedUnsentEventsString) {
        try {
          this._unsentEvents = JSON.parse(savedUnsentEventsString);
        } catch (e) {
          //log(e);
        }
      }
    }
    if (this._unsentEvents.length > 0) {
      this.sendEvents();
    }

    if (this.options.includeUtm) {
      this._initUtmData();
    }

    this._lastEventTime = parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
    this._sessionId = parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
    this._eventId = localStorage.getItem(LocalStorageKeys.LAST_EVENT_ID) || 0;
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
};

Amplitude.prototype.isNewSession = function() {
  return this._newSession;
};

Amplitude.prototype.nextEventId = function() {
  this._eventId++;
  return this._eventId;
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
    if (cookieData.globalUserProperties) {
      scope.options.userProperties = cookieData.globalUserProperties;
    }
    if (cookieData.optOut !== undefined) {
      scope.options.optOut = cookieData.optOut;
    }
  }
};

var _saveCookieData = function(scope) {
  Cookie.set(scope.options.cookieName, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    globalUserProperties: scope.options.userProperties,
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

Amplitude.prototype.saveEvents = function() {
  try {
    localStorage.setItem(this.options.unsentKey, JSON.stringify(this._unsentEvents));
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

Amplitude.prototype.setUserProperties = function(userProperties, opt_replace) {
  try {
    if (opt_replace) {
      this.options.userProperties = userProperties;
    } else {
      this.options.userProperties = object.merge(this.options.userProperties || {}, userProperties);
    }
    _saveCookieData(this);
    //log('set userProperties=' + JSON.stringify(userProperties));
  } catch (e) {
    log(e);
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

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 */
Amplitude.prototype._logEvent = function(eventType, eventProperties, apiProperties) {
  if (!eventType || this.options.optOut) {
    return;
  }
  try {
    var eventTime = new Date().getTime();
    var eventId = this.nextEventId();
    var ua = this._ua;
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, this._sessionId);
    }
    this._lastEventTime = eventTime;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, this._lastEventTime);
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_ID, eventId);

    // Add the utm properties, if any, onto the user properties.
    var userProperties = {};
    object.merge(userProperties, this.options.userProperties || {});
    object.merge(userProperties, this._utmProperties);

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
      event_properties: eventProperties,
      user_properties: userProperties,
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: this.__VERSION__
      }
      // country: null
    };

    //log('logged eventType=' + eventType + ', properties=' + JSON.stringify(eventProperties));

    this._unsentEvents.push(event);

    // Remove old events from the beginning of the array if too many
    // have accumulated. Don't want to kill memory. Default is 1000 events.
    if (this._unsentEvents.length > this.options.savedMaxCount) {
      this._unsentEvents.splice(0, this._unsentEvents.length - this.options.savedMaxCount);
    }

    if (this.options.saveEvents) {
      this.saveEvents();
    }

    this.sendEvents();

    return eventId;
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.logEvent = function(eventType, eventProperties) {
  return this._logEvent(eventType, eventProperties);
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
Amplitude.prototype.removeEvents = function (maxEventId) {
  var filteredEvents = [];
  for (var i = 0; i < this._unsentEvents.length; i++) {
    if (this._unsentEvents[i].event_id > maxEventId) {
      filteredEvents.push(this._unsentEvents[i]);
    }
  }
  this._unsentEvents = filteredEvents;
};

Amplitude.prototype.sendEvents = function() {
  if (!this._sending && !this.options.optOut) {
    this._sending = true;
    var url = ('https:' === window.location.protocol ? 'https' : 'http') + '://' +
        this.options.apiEndpoint + '/';

    // Determine how many events to send and track the maximum event id sent in this batch.
    var numEvents = Math.min(this._unsentEvents.length, this.options.uploadBatchSize);
    var maxEventId = this._unsentEvents[numEvents - 1].event_id;

    var events = JSON.stringify(this._unsentEvents.slice(0, numEvents));
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
          scope.removeEvents(maxEventId);

          // Update the event cache after the removal of sent events.
          if (scope.options.saveEvents) {
            scope.saveEvents();
          }

          // Send more events if any queued during previous send.
          if (scope._unsentEvents.length > 0) {
            scope.sendEvents();
          }
        } else if (status === 413) {
          //log('request too large');
          // Can't even get this one massive event through. Drop it.
          if (scope.options.uploadBatchSize === 1) {
            scope.removeEvents(maxEventId);
          }

          // The server complained about the length of the request.
          // Backoff and try again.
          scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
          scope.sendEvents();
        }
      } catch (e) {
        //log('failed upload');
      }
    });
  }
};

/**
 *  @deprecated
 */
Amplitude.prototype.setGlobalUserProperties = Amplitude.prototype.setUserProperties;

Amplitude.prototype.__VERSION__ = version;

module.exports = Amplitude;
