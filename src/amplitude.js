var Base64 = require('./base64');
var JSON = require('segmentio/json');
var UTF8 = require('./utf8');
var UUID = require('./uuid');
var md5 = require('./md5');
var querystring = require('component/querystring');
var localStorage = require('./localstorage');

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


var userAgent = navigator.userAgent;
var vendor = navigator.vendor;
var platform = navigator.platform;

/*
 * Browser/OS detection
 */
var BrowserDetect = {
  init: function() {
    this.browser = this.searchString(this.dataBrowser) || null;
    this.version = this.searchVersion(navigator.userAgent) ||
        this.searchVersion(navigator.appVersion) || null;
    this.OS = this.searchString(this.dataOS) || null;
  },
  searchString: function(data) {
    for (var i = 0; i < data.length; i++) {
      var dataString = data[i].string;
      var dataProp = data[i].prop;
      this.versionSearchString = data[i].versionSearch || data[i].identity;
      if (dataString) {
        if (dataString.indexOf(data[i].subString) != -1) {
          return data[i].identity;
        }
      }
      else if (dataProp) {
        return data[i].identity;
      }
    }
  },
  searchVersion: function(dataString) {
    var index = dataString.indexOf(this.versionSearchString);
    if (index == -1) {
      return;
    }
    return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
  },
  dataBrowser: [
    {
      string: userAgent,
      subString: 'Chrome',
      identity: 'Chrome'
    },
    {  string: userAgent,
      subString: 'OmniWeb',
      versionSearch: 'OmniWeb/',
      identity: 'OmniWeb'
    },
    {
      string: vendor,
      subString: 'Apple',
      identity: 'Safari',
      versionSearch: 'Version'
    },
    {
      prop: window.opera,
      identity: 'Opera',
      versionSearch: 'Version'
    },
    {
      string: vendor,
      subString: 'iCab',
      identity: 'iCab'
    },
    {
      string: vendor,
      subString: 'KDE',
      identity: 'Konqueror'
    },
    {
      string: userAgent,
      subString: 'Firefox',
      identity: 'Firefox'
    },
    {
      string: vendor,
      subString: 'Camino',
      identity: 'Camino'
    },
    {		// for newer Netscapes (6+)
      string: userAgent,
      subString: 'Netscape',
      identity: 'Netscape'
    },
    {
      string: userAgent,
      subString: 'MSIE',
      identity: 'Explorer',
      versionSearch: 'MSIE'
    },
    {
      string: userAgent,
      subString: 'Gecko',
      identity: 'Mozilla',
      versionSearch: 'rv'
    },
    { 		// for older Netscapes (4-)
      string: userAgent,
      subString: 'Mozilla',
      identity: 'Netscape',
      versionSearch: 'Mozilla'
    }
  ],
  dataOS: [
    {
      string: platform,
      subString: 'Win',
      identity: 'Windows'
    },
    {
      string: platform,
      subString: 'Mac',
      identity: 'Mac'
    },
    {
      string: userAgent,
      subString: 'iPhone',
      identity: 'iPhone/iPod'
    },
    {
      string: userAgent,
      subString: 'Android',
      identity: 'Android'
    },
    {
      string: platform,
      subString: 'Linux',
      identity: 'Linux'
    }
  ]

};
BrowserDetect.init();

/*
 * Simple AJAX request object
 */
var Request = function(url, data) {
  this.url = url;
  this.data = data || {};
};

Request.prototype.send = function(callback) {
  var isIE = window.XDomainRequest ? true : false;
  if (isIE) {
    var xdr = new window.XDomainRequest();
    xdr.open('POST', this.url, true);
    xdr.onload = function() {
      callback(xdr.responseText);
    };
    xdr.send(querystring.stringify(this.data));
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          callback(xhr.responseText);
        }
      }
    }
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(querystring.stringify(this.data));
  }
  //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));
};

/*
 * Cookie data
 */
var Cookie = {
  get: function(name) {
    var nameEq = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEq) == 0) {
        return c.substring(nameEq.length, c.length);
      }
    }
    return null;
  },
  set: function(name, value, days, domain) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = '; expires=' + date.toGMTString();
    } else {
      var expires = '';
    }
    var cookieString = name + '=' + value + expires + '; path=/' + (domain ? (";domain=" + domain) : "");
    document.cookie = cookieString;
  },
  remove: function(name, domain) {
    Cookie.set(name, '', -1, domain);
  }
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
      client: BrowserDetect.browser,
      version_code: 0,
      version_name: options.versionName || null,
      build_version_sdk: 0,
      build_version_release: BrowserDetect.version,
      phone_model: BrowserDetect.OS,
      custom_properties: eventProperties,
      global_properties: options.globalUserProperties || {}
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

Amplitude.prototype.__VERSION__ = '1.3.0';

module.exports = Amplitude;
