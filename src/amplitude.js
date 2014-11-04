var Base64 = require('./base64');
var Cookie = require('./cookie');
var JSON = require('segmentio/json');
var Request = require('./xhr');
var UTF8 = require('./utf8');
var UUID = require('./uuid');
var md5 = require('./md5');
var localStorage = require('./localstorage');
var detect = require('./detect');

/*
 * amplitude.js
 * Javascript SDK for Amplitude
 *
 * Created by Curtis Liu
 * Copyright (c) 2014 Sonalight, Inc. All rights reserved.
 */
var log = function(s) {
  console.log('[Amplitude] ' + s);
};

/*
 * Amplitude API
 */
var Amplitude = function() {
};
Amplitude.SDK_VERSION = "1.3";
Amplitude.API_VERSION = 2;

var options = {
  apiEndpoint: 'api.amplitude.com',
  cookieName: 'amplitude_id',
  cookieExpiration: 365 * 10,
  unsentKey: 'amplitude_unsent',
  saveEvents: true,
  domain: '',
  sessionTimeout: 30 * 60 * 1000
};

var ua = detect.parse(navigator.userAgent);
var eventId = 0;
var unsentEvents = [];
var sending = false;
var lastEventTime = null;
var sessionId = null;
var LocalStorageKeys = {
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  SESSION_ID: 'amplitude_sessionId'
};

var nextEventId = function() {
  eventId++;
  return eventId;
};

/**
 * Initializes Amplitude.
 * apiKey The API Key for your app
 * opt_userId An identifier for this user
 * opt_config Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 */
Amplitude.prototype.init = function(apiKey, opt_userId, opt_config) {
  try {
    this.options = options;
    options.apiKey = apiKey;
    if (opt_config) {
      if (opt_config.saveEvents !== undefined) {
        options.saveEvents = !!opt_config.saveEvents;
      }
    }

    loadCookieData();

    options.deviceId = (opt_config && opt_config.deviceId !== undefined && opt_config.deviceId !== null && opt_config.deviceId) ||
        options.deviceId || UUID();
    options.userId = (opt_userId !== undefined && opt_userId !== null && opt_userId) || options.userId || null;
    saveCookieData();

    //log('initialized with apiKey=' + apiKey);
    //opt_userId !== undefined && opt_userId !== null && log('initialized with userId=' + opt_userId);

    if (options.saveEvents) {
      var savedUnsentEventsString = localStorage.getItem(options.unsentKey);
      if (savedUnsentEventsString) {
        try {
          unsentEvents = JSON.parse(savedUnsentEventsString);
        } catch (e) {
          //log(e);
        }
      }
    }
    if (unsentEvents.length > 0) {
      this.sendEvents();
    }

    lastEventTime = parseInt(localStorage.getItem(LocalStorageKeys.LAST_EVENT_TIME)) || null;
    sessionId = parseInt(localStorage.getItem(LocalStorageKeys.SESSION_ID)) || null;
    eventId = localStorage.getItem(LocalStorageKeys.LAST_EVENT_ID) || 0;
    var now = new Date().getTime();
    if (!sessionId || !lastEventTime || now - lastEventTime > options.sessionTimeout) {
      sessionId = now;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, sessionId);
    }
    lastEventTime = now;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, lastEventTime);
  } catch (e) {
    log(e);
  }
};

var loadCookieData = function() {
  var cookie = Cookie.get(options.cookieName);
  var cookieData = null;
  if (cookie) {
    try {
      cookieData = JSON.parse(Base64.decode(cookie));
      if (cookieData) {
        if (cookieData.deviceId) {
          options.deviceId = cookieData.deviceId;
        }
        if (cookieData.userId) {
          options.userId = cookieData.userId;
        }
        if (cookieData.globalUserProperties) {
          options.globalUserProperties = cookieData.globalUserProperties;
        }
      }
    } catch (e) {
      //log(e);
    }
  }
};

var saveCookieData = function() {
  Cookie.set(options.cookieName, Base64.encode(JSON.stringify({
    deviceId: options.deviceId,
    userId: options.userId,
    globalUserProperties: options.globalUserProperties
  })), options.cookieExpiration, options.domain);
};

var saveEvents = function() {
  try {
    localStorage.setItem(options.unsentKey, JSON.stringify(unsentEvents));
  } catch (e) {
    //log(e);
  }
};

Amplitude.prototype.setDomain = function(domain) {
  try {
    options.domain = (domain !== undefined && domain !== null && ('' + domain)) || null;
    options.cookieName = "amplitude_id" + (options.domain || '');
    loadCookieData();
    saveCookieData();
    //log('set domain=' + domain);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setUserId = function(userId) {
  try {
    options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    saveCookieData();
    //log('set userId=' + userId);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setUserProperties = function(userProperties) {
  try {
    options.globalUserProperties = userProperties;
    saveCookieData();
    //log('set userProperties=' + JSON.stringify(userProperties));
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.setVersionName = function(versionName) {
  try {
    options.versionName = versionName;
    //log('set versionName=' + versionName);
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.logEvent = function(eventType, eventProperties) {
  try {
    var eventTime = new Date().getTime();
    var eventId = nextEventId();
    if (!sessionId || !lastEventTime || eventTime - lastEventTime > options.sessionTimeout) {
      sessionId = eventTime;
      localStorage.setItem(LocalStorageKeys.SESSION_ID, sessionId);
    }
    lastEventTime = eventTime;
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_TIME, lastEventTime);
    localStorage.setItem(LocalStorageKeys.LAST_EVENT_ID, eventId);

    eventProperties = eventProperties || {};
    var event = {
      device_id: options.deviceId,
      user_id: options.userId || options.deviceId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: sessionId || -1,
      event_type: eventType,
      version_name: options.versionName || null,
      platform: 'Web',
      os_name: ua.browser.family,
      os_version: ua.browser.version,
      device_model: ua.os.family,
      event_properties: eventProperties,
      user_properties: options.globalUserProperties || {},
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: this.__VERSION__
      }
      // country: null,
      // language: null
    };
    unsentEvents.push(event);
    if (options.saveEvents) {
      saveEvents();
    }
    //log('logged eventType=' + eventType + ', properties=' + JSON.stringify(eventProperties));
    this.sendEvents();
  } catch (e) {
    log(e);
  }
};

Amplitude.prototype.sendEvents = function() {
  if (!sending) {
    sending = true;
    var url = ('https:' == window.location.protocol ? 'https' : 'http') + '://' +
        options.apiEndpoint + '/';
    var events = JSON.stringify(unsentEvents);
    var uploadTime = new Date().getTime();
    var data = {
      client: options.apiKey,
      e: events,
      v: Amplitude.API_VERSION,
      upload_time: uploadTime,
      checksum: md5(Amplitude.API_VERSION + options.apiKey + events + uploadTime)
    };
    var numEvents = unsentEvents.length;
    var scope = this;
    new Request(url, data).send(function(response) {
      sending = false;
      try {
        if (response == 'success') {
          //log('sucessful upload');
          unsentEvents.splice(0, numEvents);
          if (options.saveEvents) {
            saveEvents();
          }
          if (unsentEvents.length > 0) {
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

Amplitude.prototype.__VERSION__ = '1.4.0';

module.exports = Amplitude;
