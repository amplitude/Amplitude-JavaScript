var Base64 = require('./base64');
var Cookie = require('./cookie');
var JSON = require('json');
var Request = require('./xhr');
var UTF8 = require('./utf8');
var UUID = require('./uuid');
var md5 = require('./md5');
var localStorage = require('./localstorage');
var detect = require('./detect');
var version = require('./version');
var object = require('object');

var log = function(s) {
  console.log('[Amplitude] ' + s);
};

var API_VERSION = 2;
var DEFAULT_OPTIONS = {
  apiEndpoint: 'api.amplitude.com',
  cookieName: 'amplitude_id',
  cookieExpiration: 365 * 10,
  unsentKey: 'amplitude_unsent',
  saveEvents: true,
  domain: '',
  sessionTimeout: 30 * 60 * 1000
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
  this._ua = detect.parse(navigator.userAgent);
};


Amplitude.prototype._eventId = 0;
Amplitude.prototype._sending = false;
Amplitude.prototype._lastEventTime = null;
Amplitude.prototype._sessionId = null;

/**
 * Initializes Amplitude.
 * apiKey The API Key for your app
 * opt_userId An identifier for this user
 * opt_config Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 */
Amplitude.prototype.init = function(apiKey, opt_userId, opt_config) {
  try {
    this.options = object.merge({}, DEFAULT_OPTIONS);
    this.options.apiKey = apiKey;
    if (opt_config) {
      if (opt_config.saveEvents !== undefined) {
        this.options.saveEvents = !!opt_config.saveEvents;
      }
      if (opt_config.domain !== undefined) {
        this.options.saveEvents = opt_config.domain;
      }
    }

    Cookie.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });

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

    this._lastEventTime = parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
    this._sessionId = parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
    this._eventId = localStorage.getItem(LocalStorageKeys.LAST_EVENT_ID) || 0;
    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = now;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, this._sessionId);
    }
    this._lastEventTime = now;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, this._lastEventTime);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.nextEventId = function() {
  this._eventId++;
  return this._eventId;
};

var _loadCookieData = function(scope) {
  var cookieData = Cookie.get(scope.options.cookieName);
  var cookieData = null;
  if (cookieData) {
    if (cookieData.deviceId) {
      scope.options.deviceId = cookieData.deviceId;
    }
    if (cookieData.userId) {
      scope.options.userId = cookieData.userId;
    }
    if (cookieData.globalUserProperties) {
      scope.options.globalUserProperties = cookieData.globalUserProperties;
    }
  }
};

var _saveCookieData = function(scope) {
  Cookie.set(scope.options.cookieName, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    globalUserProperties: scope.options.globalUserProperties
  });
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

Amplitude.prototype.setUserProperties = function(userProperties) {
  try {
    this.options.globalUserProperties = userProperties;
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

Amplitude.prototype.logEvent = function(eventType, eventProperties) {
  if (!eventType) {
    return;
  }
  try {
    var eventTime = new Date().getTime();
    var eventId = this.nextEventId();
    var sessionId = this._sessionId;
    var lastEventTime = this._lastEventTime;
    var ua = this._ua;
    if (!sessionId || !lastEventTime || eventTime - lastEventTime > this.options.sessionTimeout) {
      sessionId = eventTime;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, sessionId);
    }
    lastEventTime = eventTime;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, lastEventTime);
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_ID, eventId);

    eventProperties = eventProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId || this.options.deviceId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: sessionId || -1,
      event_type: eventType,
      version_name: this.options.versionName || null,
      platform: 'Web',
      os_name: ua.browser.family,
      os_version: ua.browser.version,
      device_model: ua.os.family,
      event_properties: eventProperties,
      user_properties: this.options.globalUserProperties || {},
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: this.__VERSION__
      }
      // country: null,
      // language: null
    };
    this._unsentEvents.push(event);
    if (this.options.saveEvents) {
      this.saveEvents();
    }
    //log('logged eventType=' + eventType + ', properties=' + JSON.stringify(eventProperties));
    this.sendEvents();
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.sendEvents = function() {
  if (!this._sending) {
    this._sending = true;
    var url = ('https:' == window.location.protocol ? 'https' : 'http') + '://' +
        this.options.apiEndpoint + '/';
    var events = JSON.stringify(this._unsentEvents);
    var uploadTime = new Date().getTime();
    var data = {
      client: this.options.apiKey,
      e: events,
      v: API_VERSION,
      upload_time: uploadTime,
      checksum: md5(API_VERSION + this.options.apiKey + events + uploadTime)
    };
    var numEvents = this._unsentEvents.length;
    var scope = this;
    new Request(url, data).send(function(response) {
      scope._sending = false;
      try {
        if (response == 'success') {
          //log('sucessful upload');
          scope._unsentEvents.splice(0, numEvents);
          if (scope.options.saveEvents) {
            scope.saveEvents();
          }
          if (scope._unsentEvents.length > 0) {
            scope.sendEvents();
          }
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
