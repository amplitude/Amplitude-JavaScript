import _objectSpread from '@babel/runtime/helpers/objectSpread';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _typeof from '@babel/runtime/helpers/typeof';
import md5 from 'blueimp-md5';
import queryString from 'query-string';
import UAParser from '@amplitude/ua-parser-js';

var Constants = {
  DEFAULT_INSTANCE: '$default_instance',
  API_VERSION: 2,
  MAX_STRING_LENGTH: 4096,
  MAX_PROPERTY_KEYS: 1000,
  IDENTIFY_EVENT: '$identify',
  GROUP_IDENTIFY_EVENT: '$groupidentify',
  // localStorageKeys
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  LAST_IDENTIFY_ID: 'amplitude_lastIdentifyId',
  LAST_SEQUENCE_NUMBER: 'amplitude_lastSequenceNumber',
  SESSION_ID: 'amplitude_sessionId',
  // Used in cookie as well
  DEVICE_ID: 'amplitude_deviceId',
  OPT_OUT: 'amplitude_optOut',
  USER_ID: 'amplitude_userId',
  COOKIE_TEST: 'amplitude_cookie_test',
  // revenue keys
  REVENUE_EVENT: 'revenue_amount',
  REVENUE_PRODUCT_ID: '$productId',
  REVENUE_QUANTITY: '$quantity',
  REVENUE_PRICE: '$price',
  REVENUE_REVENUE_TYPE: '$revenueType',
  AMP_DEVICE_ID_PARAM: 'amp_device_id',
  // url param
  REFERRER: 'referrer',
  // UTM Params
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content'
};

/* jshint bitwise: false */

/*
 * UTF-8 encoder/decoder
 * http://www.webtoolkit.info/
 */
var UTF8 = {
  encode: function encode(s) {
    var utftext = '';

    for (var n = 0; n < s.length; n++) {
      var c = s.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode(c >> 6 | 192);
        utftext += String.fromCharCode(c & 63 | 128);
      } else {
        utftext += String.fromCharCode(c >> 12 | 224);
        utftext += String.fromCharCode(c >> 6 & 63 | 128);
        utftext += String.fromCharCode(c & 63 | 128);
      }
    }

    return utftext;
  },
  decode: function decode(utftext) {
    var s = '';
    var i = 0;
    var c = 0,
        c1 = 0,
        c2 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        s += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c1 = utftext.charCodeAt(i + 1);
        s += String.fromCharCode((c & 31) << 6 | c1 & 63);
        i += 2;
      } else {
        c1 = utftext.charCodeAt(i + 1);
        c2 = utftext.charCodeAt(i + 2);
        s += String.fromCharCode((c & 15) << 12 | (c1 & 63) << 6 | c2 & 63);
        i += 3;
      }
    }

    return s;
  }
};

/* jshint bitwise: false */
/*
 * Base64 encoder/decoder
 * http://www.webtoolkit.info/
 */

var Base64 = {
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  encode: function encode(input) {
    try {
      if (window.btoa && window.atob) {
        return window.btoa(unescape(encodeURIComponent(input)));
      }
    } catch (e) {//log(e);
    }

    return Base64._encode(input);
  },
  _encode: function _encode(input) {
    var output = '';
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = UTF8.encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
    }

    return output;
  },
  decode: function decode(input) {
    try {
      if (window.btoa && window.atob) {
        return decodeURIComponent(escape(window.atob(input)));
      }
    } catch (e) {//log(e);
    }

    return Base64._decode(input);
  },
  _decode: function _decode(input) {
    var output = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {
      enc1 = Base64._keyStr.indexOf(input.charAt(i++));
      enc2 = Base64._keyStr.indexOf(input.charAt(i++));
      enc3 = Base64._keyStr.indexOf(input.charAt(i++));
      enc4 = Base64._keyStr.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }

      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = UTF8.decode(output);
    return output;
  }
};

/**
 * toString ref.
 * @private
 */
var toString = Object.prototype.toString;
/**
 * Return the type of `val`.
 * @private
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

function type (val) {
  switch (toString.call(val)) {
    case '[object Date]':
      return 'date';

    case '[object RegExp]':
      return 'regexp';

    case '[object Arguments]':
      return 'arguments';

    case '[object Array]':
      return 'array';

    case '[object Error]':
      return 'error';
  }

  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (val !== val) {
    return 'nan';
  }

  if (val && val.nodeType === 1) {
    return 'element';
  }

  if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(val)) {
    return 'buffer';
  }

  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
  return _typeof(val);
}

var logLevels = {
  DISABLE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3
};
var logLevel = logLevels.WARN;

var setLogLevel = function setLogLevel(logLevelName) {
  if (logLevels.hasOwnProperty(logLevelName)) {
    logLevel = logLevels[logLevelName];
  }
};

var getLogLevel = function getLogLevel() {
  return logLevel;
};

var log = {
  error: function error(s) {
    if (logLevel >= logLevels.ERROR) {
      _log(s);
    }
  },
  warn: function warn(s) {
    if (logLevel >= logLevels.WARN) {
      _log(s);
    }
  },
  info: function info(s) {
    if (logLevel >= logLevels.INFO) {
      _log(s);
    }
  }
};

var _log = function _log(s) {
  try {
    console.log('[Amplitude] ' + s);
  } catch (e) {// console logging not available
  }
};

var isEmptyString = function isEmptyString(str) {
  return !str || str.length === 0;
};

var sessionStorageEnabled = function sessionStorageEnabled() {
  try {
    if (window.sessionStorage) {
      return true;
    }
  } catch (e) {} // sessionStorage disabled


  return false;
}; // truncate string values in event and user properties so that request size does not get too large


var truncate = function truncate(value) {
  if (type(value) === 'array') {
    for (var i = 0; i < value.length; i++) {
      value[i] = truncate(value[i]);
    }
  } else if (type(value) === 'object') {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        value[key] = truncate(value[key]);
      }
    }
  } else {
    value = _truncateValue(value);
  }

  return value;
};

var _truncateValue = function _truncateValue(value) {
  if (type(value) === 'string') {
    return value.length > Constants.MAX_STRING_LENGTH ? value.substring(0, Constants.MAX_STRING_LENGTH) : value;
  }

  return value;
};

var validateInput = function validateInput(input, name, expectedType) {
  if (type(input) !== expectedType) {
    log.error('Invalid ' + name + ' input type. Expected ' + expectedType + ' but received ' + type(input));
    return false;
  }

  return true;
}; // do some basic sanitization and type checking, also catch property dicts with more than 1000 key/value pairs


var validateProperties = function validateProperties(properties) {
  var propsType = type(properties);

  if (propsType !== 'object') {
    log.error('Error: invalid properties format. Expecting Javascript object, received ' + propsType + ', ignoring');
    return {};
  }

  if (Object.keys(properties).length > Constants.MAX_PROPERTY_KEYS) {
    log.error('Error: too many properties (more than 1000), ignoring');
    return {};
  }

  var copy = {}; // create a copy with all of the valid properties

  for (var property in properties) {
    if (!properties.hasOwnProperty(property)) {
      continue;
    } // validate key


    var key = property;
    var keyType = type(key);

    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string property key, received type ' + keyType + ', coercing to string "' + key + '"');
    } // validate value


    var value = validatePropertyValue(key, properties[property]);

    if (value === null) {
      continue;
    }

    copy[key] = value;
  }

  return copy;
};

var invalidValueTypes = ['nan', 'function', 'arguments', 'regexp', 'element'];

var validatePropertyValue = function validatePropertyValue(key, value) {
  var valueType = type(value);

  if (invalidValueTypes.indexOf(valueType) !== -1) {
    log.warn('WARNING: Property key "' + key + '" with invalid value type ' + valueType + ', ignoring');
    value = null;
  } else if (valueType === 'undefined') {
    value = null;
  } else if (valueType === 'error') {
    value = String(value);
    log.warn('WARNING: Property key "' + key + '" with value type error, coercing to ' + value);
  } else if (valueType === 'array') {
    // check for nested arrays or objects
    var arrayCopy = [];

    for (var i = 0; i < value.length; i++) {
      var element = value[i];
      var elemType = type(element);

      if (elemType === 'array') {
        log.warn('WARNING: Cannot have ' + elemType + ' nested in an array property value, skipping');
        continue;
      } else if (elemType === 'object') {
        arrayCopy.push(validateProperties(element));
      } else {
        arrayCopy.push(validatePropertyValue(key, element));
      }
    }

    value = arrayCopy;
  } else if (valueType === 'object') {
    value = validateProperties(value);
  }

  return value;
};

var validateGroups = function validateGroups(groups) {
  var groupsType = type(groups);

  if (groupsType !== 'object') {
    log.error('Error: invalid groups format. Expecting Javascript object, received ' + groupsType + ', ignoring');
    return {};
  }

  var copy = {}; // create a copy with all of the valid properties

  for (var group in groups) {
    if (!groups.hasOwnProperty(group)) {
      continue;
    } // validate key


    var key = group;
    var keyType = type(key);

    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string groupType, received type ' + keyType + ', coercing to string "' + key + '"');
    } // validate value


    var value = validateGroupName(key, groups[group]);

    if (value === null) {
      continue;
    }

    copy[key] = value;
  }

  return copy;
};

var validateGroupName = function validateGroupName(key, groupName) {
  var groupNameType = type(groupName);

  if (groupNameType === 'string') {
    return groupName;
  }

  if (groupNameType === 'date' || groupNameType === 'number' || groupNameType === 'boolean') {
    groupName = String(groupName);
    log.warn('WARNING: Non-string groupName, received type ' + groupNameType + ', coercing to string "' + groupName + '"');
    return groupName;
  }

  if (groupNameType === 'array') {
    // check for nested arrays or objects
    var arrayCopy = [];

    for (var i = 0; i < groupName.length; i++) {
      var element = groupName[i];
      var elemType = type(element);

      if (elemType === 'array' || elemType === 'object') {
        log.warn('WARNING: Skipping nested ' + elemType + ' in array groupName');
        continue;
      } else if (elemType === 'string') {
        arrayCopy.push(element);
      } else if (elemType === 'date' || elemType === 'number' || elemType === 'boolean') {
        element = String(element);
        log.warn('WARNING: Non-string groupName, received type ' + elemType + ', coercing to string "' + element + '"');
        arrayCopy.push(element);
      }
    }

    return arrayCopy;
  }

  log.warn('WARNING: Non-string groupName, received type ' + groupNameType + '. Please use strings or array of strings for groupName');
}; // parses the value of a url param (for example ?gclid=1234&...)


var getQueryParam = function getQueryParam(name, query) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(query);
  return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var utils = {
  setLogLevel: setLogLevel,
  getLogLevel: getLogLevel,
  logLevels: logLevels,
  log: log,
  isEmptyString: isEmptyString,
  getQueryParam: getQueryParam,
  sessionStorageEnabled: sessionStorageEnabled,
  truncate: truncate,
  validateGroups: validateGroups,
  validateInput: validateInput,
  validateProperties: validateProperties
};

var getLocation = function getLocation() {
  return window.location;
};

var get = function get(name) {
  try {
    var ca = document.cookie.split(';');
    var value = null;

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];

      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }

      if (c.indexOf(name) === 0) {
        value = c.substring(name.length, c.length);
        break;
      }
    }

    return value;
  } catch (e) {
    return null;
  }
};

var set = function set(name, value, opts) {
  var expires = value !== null ? opts.expirationDays : -1;

  if (expires) {
    var date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    expires = date;
  }

  var str = name + '=' + value;

  if (expires) {
    str += '; expires=' + expires.toUTCString();
  }

  str += '; path=/';

  if (opts.domain) {
    str += '; domain=' + opts.domain;
  }

  if (opts.secure) {
    str += '; Secure';
  }

  document.cookie = str;
};

var baseCookie = {
  set: set,
  get: get
};

/*
 * Cookie data
 */
var _options = {
  expirationDays: undefined,
  domain: undefined
};

var reset = function reset() {
  _options = {
    expirationDays: undefined,
    domain: undefined
  };
};

var getHost = function getHost(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname || location.hostname;
};

var topDomain = function topDomain(url) {
  var host = getHost(url);
  var parts = host.split('.');
  var last = parts[parts.length - 1];
  var levels = [];

  if (parts.length === 4 && last === parseInt(last, 10)) {
    return levels;
  }

  if (parts.length <= 1) {
    return levels;
  }

  for (var i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  for (var _i = 0; _i < levels.length; ++_i) {
    var cname = '__tld_test__';
    var domain = levels[_i];
    var opts = {
      domain: '.' + domain
    };
    baseCookie.set(cname, 1, opts);

    if (baseCookie.get(cname)) {
      baseCookie.set(cname, null, opts);
      return domain;
    }
  }

  return '';
};

var options = function options(opts) {
  if (arguments.length === 0) {
    return _options;
  }

  opts = opts || {};
  _options.expirationDays = opts.expirationDays;
  _options.secure = opts.secure;
  var domain = !utils.isEmptyString(opts.domain) ? opts.domain : '.' + topDomain(getLocation().href);
  var token = Math.random();
  _options.domain = domain;
  set$1('amplitude_test', token);
  var stored = get$1('amplitude_test');

  if (!stored || stored !== token) {
    domain = null;
  }

  remove('amplitude_test');
  _options.domain = domain;
  return _options;
};

var _domainSpecific = function _domainSpecific(name) {
  // differentiate between cookies on different domains
  var suffix = '';

  if (_options.domain) {
    suffix = _options.domain.charAt(0) === '.' ? _options.domain.substring(1) : _options.domain;
  }

  return name + suffix;
};

var get$1 = function get(name) {
  var nameEq = _domainSpecific(name) + '=';
  var value = baseCookie.get(nameEq);

  try {
    if (value) {
      return JSON.parse(Base64.decode(value));
    }
  } catch (e) {
    return null;
  }

  return null;
};

var set$1 = function set(name, value) {
  try {
    baseCookie.set(_domainSpecific(name), Base64.encode(JSON.stringify(value)), _options);
    return true;
  } catch (e) {
    return false;
  }
};

var remove = function remove(name) {
  try {
    baseCookie.set(_domainSpecific(name), null, _options);
    return true;
  } catch (e) {
    return false;
  }
};

var Cookie = {
  reset: reset,
  options: options,
  get: get$1,
  set: set$1,
  remove: remove
};

/* jshint -W020, unused: false, noempty: false, boss: true */

/*
 * Implement localStorage to support Firefox 2-3 and IE 5-7
 */
var localStorage; // jshint ignore:line

{
  localStorage = window.localStorage;
}

var localStorage$1 = localStorage;

/* jshint -W020, unused: false, noempty: false, boss: true */

var cookieStorage = function cookieStorage() {
  this.storage = null;
}; // test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly


cookieStorage.prototype._cookiesEnabled = function () {
  var uid = String(new Date());
  var result;

  try {
    Cookie.set(Constants.COOKIE_TEST, uid);
    result = Cookie.get(Constants.COOKIE_TEST) === uid;
    Cookie.remove(Constants.COOKIE_TEST);
    return result;
  } catch (e) {// cookies are not enabled
  }

  return false;
};

cookieStorage.prototype.getStorage = function () {
  if (this.storage !== null) {
    return this.storage;
  }

  if (this._cookiesEnabled()) {
    this.storage = Cookie;
  } else {
    // if cookies disabled, fallback to localstorage
    // note: localstorage does not persist across subdomains
    var keyPrefix = 'amp_cookiestore_';
    this.storage = {
      _options: {
        expirationDays: undefined,
        domain: undefined,
        secure: false
      },
      reset: function reset() {
        this._options = {
          expirationDays: undefined,
          domain: undefined,
          secure: false
        };
      },
      options: function options(opts) {
        if (arguments.length === 0) {
          return this._options;
        }

        opts = opts || {};
        this._options.expirationDays = opts.expirationDays || this._options.expirationDays; // localStorage is specific to subdomains

        this._options.domain = opts.domain || this._options.domain || window && window.location && window.location.hostname;
        return this._options.secure = opts.secure || false;
      },
      get: function get(name) {
        try {
          return JSON.parse(localStorage$1.getItem(keyPrefix + name));
        } catch (e) {}

        return null;
      },
      set: function set(name, value) {
        try {
          localStorage$1.setItem(keyPrefix + name, JSON.stringify(value));
          return true;
        } catch (e) {}

        return false;
      },
      remove: function remove(name) {
        try {
          localStorage$1.removeItem(keyPrefix + name);
        } catch (e) {
          return false;
        }
      }
    };
  }

  return this.storage;
};

var getUtmData = function getUtmData(rawCookie, query) {
  // Translate the utmz cookie format into url query string format.
  var cookie = rawCookie ? '?' + rawCookie.split('.').slice(-1)[0].replace(/\|/g, '&') : '';

  var fetchParam = function fetchParam(queryName, query, cookieName, cookie) {
    return utils.getQueryParam(queryName, query) || utils.getQueryParam(cookieName, cookie);
  };

  var utmSource = fetchParam(Constants.UTM_SOURCE, query, 'utmcsr', cookie);
  var utmMedium = fetchParam(Constants.UTM_MEDIUM, query, 'utmcmd', cookie);
  var utmCampaign = fetchParam(Constants.UTM_CAMPAIGN, query, 'utmccn', cookie);
  var utmTerm = fetchParam(Constants.UTM_TERM, query, 'utmctr', cookie);
  var utmContent = fetchParam(Constants.UTM_CONTENT, query, 'utmcct', cookie);
  var utmData = {};

  var addIfNotNull = function addIfNotNull(key, value) {
    if (!utils.isEmptyString(value)) {
      utmData[key] = value;
    }
  };

  addIfNotNull(Constants.UTM_SOURCE, utmSource);
  addIfNotNull(Constants.UTM_MEDIUM, utmMedium);
  addIfNotNull(Constants.UTM_CAMPAIGN, utmCampaign);
  addIfNotNull(Constants.UTM_TERM, utmTerm);
  addIfNotNull(Constants.UTM_CONTENT, utmContent);
  return utmData;
};

/*
 * Wrapper for a user properties JSON object that supports operations.
 * Note: if a user property is used in multiple operations on the same Identify object,
 * only the first operation will be saved, and the rest will be ignored.
 */

var AMP_OP_ADD = '$add';
var AMP_OP_APPEND = '$append';
var AMP_OP_CLEAR_ALL = '$clearAll';
var AMP_OP_PREPEND = '$prepend';
var AMP_OP_SET = '$set';
var AMP_OP_SET_ONCE = '$setOnce';
var AMP_OP_UNSET = '$unset';
/**
 * Identify API - instance constructor. Identify objects are a wrapper for user property operations.
 * Each method adds a user property operation to the Identify object, and returns the same Identify object,
 * allowing you to chain multiple method calls together.
 * Note: if the same user property is used in multiple operations on a single Identify object,
 * only the first operation on that property will be saved, and the rest will be ignored.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
 * for more information on the Identify API and user property operations.
 * @constructor Identify
 * @public
 * @example var identify = new amplitude.Identify();
 */

var Identify = function Identify() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};
/**
 * Increment a user property by a given value (can also be negative to decrement).
 * If the user property does not have a value set yet, it will be initialized to 0 before being incremented.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string} value - The amount by which to increment the user property. Allows numbers as strings (ex: '123').
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().add('karma', 1).add('friends', 1);
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.add = function (property, value) {
  if (type(value) === 'number' || type(value) === 'string') {
    this._addOperation(AMP_OP_ADD, property, value);
  } else {
    utils.log.error('Unsupported type for value: ' + type(value) + ', expecting number or string');
  }

  return this;
};
/**
 * Append a value or values to a user property.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are appended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values appended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to append.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().append('ab-tests', 'new-user-tests');
 * identify.append('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.append = function (property, value) {
  this._addOperation(AMP_OP_APPEND, property, value);

  return this;
};
/**
 * Clear all user properties for the current user.
 * SDK user should instead call amplitude.clearUserProperties() instead of using this.
 * $clearAll needs to be sent on its own Identify object. If there are already other operations, then don't add $clearAll.
 * If $clearAll already in an Identify object, don't allow other operations to be added.
 * @private
 */


Identify.prototype.clearAll = function () {
  if (Object.keys(this.userPropertiesOperations).length > 0) {
    if (!this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
      utils.log.error('Need to send $clearAll on its own Identify object without any other operations, skipping $clearAll');
    }

    return this;
  }

  this.userPropertiesOperations[AMP_OP_CLEAR_ALL] = '-';
  return this;
};
/**
 * Prepend a value or values to a user property.
 * Prepend means inserting the value or values at the front of a list.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are prepended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values prepended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to prepend.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().prepend('ab-tests', 'new-user-tests');
 * identify.prepend('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.prepend = function (property, value) {
  this._addOperation(AMP_OP_PREPEND, property, value);

  return this;
};
/**
 * Sets the value of a given user property. If a value already exists, it will be overwriten with the new value.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to set.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().set('user_type', 'beta');
 * identify.set('name', {'first': 'John', 'last': 'Doe'}); // dict is flattened and becomes name.first: John, name.last: Doe
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.set = function (property, value) {
  this._addOperation(AMP_OP_SET, property, value);

  return this;
};
/**
 * Sets the value of a given user property only once. Subsequent setOnce operations on that user property will be ignored;
 * however, that user property can still be modified through any of the other operations.
 * Useful for capturing properties such as 'initial_signup_date', 'initial_referrer', etc.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to set once.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().setOnce('sign_up_date', '2016-04-01');
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.setOnce = function (property, value) {
  this._addOperation(AMP_OP_SET_ONCE, property, value);

  return this;
};
/**
 * Unset and remove a user property. This user property will no longer show up in a user's profile.
 * @public
 * @param {string} property - The user property key.
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().unset('user_type').unset('age');
 * amplitude.identify(identify); // send the Identify call
 */


Identify.prototype.unset = function (property) {
  this._addOperation(AMP_OP_UNSET, property, '-');

  return this;
};
/**
 * Helper function that adds operation to the Identify's object
 * Handle's filtering of duplicate user property keys, and filtering for clearAll.
 * @private
 */


Identify.prototype._addOperation = function (operation, property, value) {
  // check that the identify doesn't already contain a clearAll
  if (this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
    utils.log.error('This identify already contains a $clearAll operation, skipping operation ' + operation);
    return;
  } // check that property wasn't already used in this Identify


  if (this.properties.indexOf(property) !== -1) {
    utils.log.error('User property "' + property + '" already used in this identify, skipping operation ' + operation);
    return;
  }

  if (!this.userPropertiesOperations.hasOwnProperty(operation)) {
    this.userPropertiesOperations[operation] = {};
  }

  this.userPropertiesOperations[operation][property] = value;
  this.properties.push(property);
};

/*
 * Simple AJAX request object
 */

var Request = function Request(url, data) {
  this.url = url;
  this.data = data || {};
};

Request.prototype.send = function (callback) {
  var isIE = window.XDomainRequest ? true : false;

  if (isIE) {
    var xdr = new window.XDomainRequest();
    xdr.open('POST', this.url, true);

    xdr.onload = function () {
      callback(200, xdr.responseText);
    };

    xdr.onerror = function () {
      // status code not available from xdr, try string matching on responseText
      if (xdr.responseText === 'Request Entity Too Large') {
        callback(413, xdr.responseText);
      } else {
        callback(500, xdr.responseText);
      }
    };

    xdr.ontimeout = function () {};

    xdr.onprogress = function () {};

    xdr.send(queryString.stringify(this.data));
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status, xhr.responseText);
      }
    };

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(queryString.stringify(this.data));
  } //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));

};

/*
 * Wrapper for logging Revenue data. Revenue objects get passed to amplitude.logRevenueV2 to send to Amplitude servers.
 * Note: price is the only required field. If quantity is not specified, then defaults to 1.
 */

/**
 * Revenue API - instance constructor. Revenue objects are a wrapper for revenue data.
 * Each method updates a revenue property in the Revenue object, and returns the same Revenue object,
 * allowing you to chain multiple method calls together.
 * Note: price is a required field to log revenue events.
 * If quantity is not specified then defaults to 1.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue} for more information
 * about logging Revenue.
 * @constructor Revenue
 * @public
 * @example var revenue = new amplitude.Revenue();
 */

var Revenue = function Revenue() {
  // required fields
  this._price = null; // optional fields

  this._productId = null;
  this._quantity = 1;
  this._revenueType = null;
  this._properties = null;
};
/**
 * Set a value for the product identifer.
 * @public
 * @param {string} productId - The value for the product identifier. Empty and invalid strings are ignored.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */


Revenue.prototype.setProductId = function setProductId(productId) {
  if (type(productId) !== 'string') {
    utils.log.error('Unsupported type for productId: ' + type(productId) + ', expecting string');
  } else if (utils.isEmptyString(productId)) {
    utils.log.error('Invalid empty productId');
  } else {
    this._productId = productId;
  }

  return this;
};
/**
 * Set a value for the quantity. Note revenue amount is calculated as price * quantity.
 * @public
 * @param {number} quantity - Integer value for the quantity. If not set, quantity defaults to 1.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setQuantity(5);
 * amplitude.logRevenueV2(revenue);
 */


Revenue.prototype.setQuantity = function setQuantity(quantity) {
  if (type(quantity) !== 'number') {
    utils.log.error('Unsupported type for quantity: ' + type(quantity) + ', expecting number');
  } else {
    this._quantity = parseInt(quantity);
  }

  return this;
};
/**
 * Set a value for the price. This field is required for all revenue being logged.
 * Note revenue amount is calculated as price * quantity.
 * @public
 * @param {number} price - Double value for the quantity.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */


Revenue.prototype.setPrice = function setPrice(price) {
  if (type(price) !== 'number') {
    utils.log.error('Unsupported type for price: ' + type(price) + ', expecting number');
  } else {
    this._price = price;
  }

  return this;
};
/**
 * Set a value for the revenueType (for example purchase, cost, tax, refund, etc).
 * @public
 * @param {string} revenueType - RevenueType to designate.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setRevenueType('purchase');
 * amplitude.logRevenueV2(revenue);
 */


Revenue.prototype.setRevenueType = function setRevenueType(revenueType) {
  if (type(revenueType) !== 'string') {
    utils.log.error('Unsupported type for revenueType: ' + type(revenueType) + ', expecting string');
  } else {
    this._revenueType = revenueType;
  }

  return this;
};
/**
 * Set event properties for the revenue event.
 * @public
 * @param {object} eventProperties - Revenue event properties to set.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var event_properties = {'city': 'San Francisco'};
 * var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setEventProperties(event_properties);
 * amplitude.logRevenueV2(revenue);
*/


Revenue.prototype.setEventProperties = function setEventProperties(eventProperties) {
  if (type(eventProperties) !== 'object') {
    utils.log.error('Unsupported type for eventProperties: ' + type(eventProperties) + ', expecting object');
  } else {
    this._properties = utils.validateProperties(eventProperties);
  }

  return this;
};
/**
 * @private
 */


Revenue.prototype._isValidRevenue = function _isValidRevenue() {
  if (type(this._price) !== 'number') {
    utils.log.error('Invalid revenue, need to set price field');
    return false;
  }

  return true;
};
/**
 * @private
 */


Revenue.prototype._toJSONObject = function _toJSONObject() {
  var obj = type(this._properties) === 'object' ? this._properties : {};

  if (this._productId !== null) {
    obj[Constants.REVENUE_PRODUCT_ID] = this._productId;
  }

  if (this._quantity !== null) {
    obj[Constants.REVENUE_QUANTITY] = this._quantity;
  }

  if (this._price !== null) {
    obj[Constants.REVENUE_PRICE] = this._price;
  }

  if (this._revenueType !== null) {
    obj[Constants.REVENUE_REVENUE_TYPE] = this._revenueType;
  }

  return obj;
};

/* jshint bitwise: false, laxbreak: true */

/**
 * Source: [jed's gist]{@link https://gist.github.com/982883}.
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 * Used to generate UUIDs for deviceIds.
 * @private
 */
var uuid = function uuid(a) {
  return a // if the placeholder was passed, return
  ? ( // a random number from 0 to 15
  a ^ // unless b is 8,
  Math.random() // in which case
  * 16 // a random number from
  >> a / 4 // 8 to 11
  ).toString(16) // in hexadecimal
  : ( // or otherwise a concatenated string:
  [1e7] + // 10000000 +
  -1e3 + // -1000 +
  -4e3 + // -4000 +
  -8e3 + // -80000000 +
  -1e11 // -100000000000,
  ).replace( // replacing
  /[018]/g, // zeroes, ones, and eights with
  uuid // random hex digits
  );
};

var version = "5.5.0";

var getLanguage = function getLanguage() {
  return navigator && (navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage) || undefined;
};

var language = {
  language: getLanguage()
};

var platform = 'Web';

var DEFAULT_OPTIONS = {
  apiEndpoint: 'api.amplitude.com',
  batchEvents: false,
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  deviceIdFromUrlParam: false,
  domain: '',
  eventUploadPeriodMillis: 30 * 1000,
  // 30s
  eventUploadThreshold: 30,
  forceHttps: true,
  includeGclid: false,
  includeReferrer: false,
  includeUtm: false,
  language: language.language,
  logLevel: 'WARN',
  optOut: false,
  onError: function onError() {},
  platform: platform,
  savedMaxCount: 1000,
  saveEvents: true,
  saveParamsReferrerOncePerSession: true,
  secureCookie: false,
  sessionTimeout: 30 * 60 * 1000,
  trackingOptions: {
    city: true,
    country: true,
    carrier: true,
    device_manufacturer: true,
    device_model: true,
    dma: true,
    ip_address: true,
    language: true,
    os_name: true,
    os_version: true,
    platform: true,
    region: true,
    version_name: true
  },
  unsetParamsReferrerOnNewSession: false,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100
};

var AsyncStorage;
var DeviceInfo;
/**
 * AmplitudeClient SDK API - instance constructor.
 * The Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()
 * @constructor AmplitudeClient
 * @public
 * @example var amplitudeClient = new AmplitudeClient();
 */


var AmplitudeClient = function AmplitudeClient(instanceName) {
  this._instanceName = utils.isEmptyString(instanceName) ? Constants.DEFAULT_INSTANCE : instanceName.toLowerCase();
  this._legacyStorageSuffix = this._instanceName === Constants.DEFAULT_INSTANCE ? '' : '_' + this._instanceName;
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = _objectSpread({}, DEFAULT_OPTIONS, {
    trackingOptions: _objectSpread({}, DEFAULT_OPTIONS.trackingOptions)
  });
  this.cookieStorage = new cookieStorage().getStorage();
  this._q = []; // queue for proxied functions before script load

  this._sending = false;
  this._updateScheduled = false;
  this._onInit = []; // event meta data

  this._eventId = 0;
  this._identifyId = 0;
  this._lastEventTime = null;
  this._newSession = false;
  this._sequenceNumber = 0;
  this._sessionId = null;
  this._isInitialized = false;
  this._userAgent = navigator && navigator.userAgent || null;
};

AmplitudeClient.prototype.Identify = Identify;
AmplitudeClient.prototype.Revenue = Revenue;
/**
 * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
 * This is required before any other methods can be called.
 * @public
 * @param {string} apiKey - The API key for your app.
 * @param {string} opt_userId - (optional) An identifier for this user.
 * @param {object} opt_config - (optional) Configuration options.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.
 * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
 * @example amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
 */

AmplitudeClient.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
  var _this = this;

  if (type(apiKey) !== 'string' || utils.isEmptyString(apiKey)) {
    utils.log.error('Invalid apiKey. Please re-initialize with a valid apiKey');
    return;
  }

  try {
    this.options.apiKey = apiKey;
    this._storageSuffix = '_' + apiKey + this._legacyStorageSuffix;

    _parseConfig(this.options, opt_config);

    if (type(this.options.logLevel) === 'string') {
      utils.setLogLevel(this.options.logLevel);
    }

    var trackingOptions = _generateApiPropertiesTrackingConfig(this);

    this._apiPropertiesTrackingOptions = Object.keys(trackingOptions).length > 0 ? {
      tracking_options: trackingOptions
    } : {};
    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain,
      secure: this.options.secureCookie
    });
    this.options.domain = this.cookieStorage.options().domain;

    {
      if (this._instanceName === Constants.DEFAULT_INSTANCE) {
        _upgradeCookieData(this);
      }
    }

    _loadCookieData(this);

    this._pendingReadStorage = true;

    var initFromStorage = function initFromStorage(deviceId) {
      // load deviceId and userId from input, or try to fetch existing value from cookie
      _this.options.deviceId = type(opt_config) === 'object' && type(opt_config.deviceId) === 'string' && !utils.isEmptyString(opt_config.deviceId) && opt_config.deviceId || _this.options.deviceIdFromUrlParam && _this._getDeviceIdFromUrlParam(_this._getUrlParams()) || _this.options.deviceId || deviceId || uuid() + 'R';
      _this.options.userId = type(opt_userId) === 'string' && !utils.isEmptyString(opt_userId) && opt_userId || type(opt_userId) === 'number' && opt_userId.toString() || _this.options.userId || null;
      var now = new Date().getTime();

      if (!_this._sessionId || !_this._lastEventTime || now - _this._lastEventTime > _this.options.sessionTimeout) {
        if (_this.options.unsetParamsReferrerOnNewSession) {
          _this._unsetUTMParams();
        }

        _this._newSession = true;
        _this._sessionId = now; // only capture UTM params and referrer if new session

        if (_this.options.saveParamsReferrerOncePerSession) {
          _this._trackParamsAndReferrer();
        }
      }

      if (!_this.options.saveParamsReferrerOncePerSession) {
        _this._trackParamsAndReferrer();
      } // load unsent events and identifies before any attempt to log new ones


      if (_this.options.saveEvents) {
        // validate event properties for unsent events
        for (var i = 0; i < _this._unsentEvents.length; i++) {
          var eventProperties = _this._unsentEvents[i].event_properties;
          var groups = _this._unsentEvents[i].groups;
          _this._unsentEvents[i].event_properties = utils.validateProperties(eventProperties);
          _this._unsentEvents[i].groups = utils.validateGroups(groups);
        } // validate user properties for unsent identifys


        for (var j = 0; j < _this._unsentIdentifys.length; j++) {
          var userProperties = _this._unsentIdentifys[j].user_properties;
          var identifyGroups = _this._unsentIdentifys[j].groups;
          _this._unsentIdentifys[j].user_properties = utils.validateProperties(userProperties);
          _this._unsentIdentifys[j].groups = utils.validateGroups(identifyGroups);
        }
      }

      _this._lastEventTime = now;

      _saveCookieData(_this);

      _this._pendingReadStorage = false;

      _this._sendEventsIfReady(); // try sending unsent events


      for (var _i = 0; _i < _this._onInit.length; _i++) {
        _this._onInit[_i]();
      }

      _this._onInit = [];
      _this._isInitialized = true;
    };

    if (AsyncStorage) {
      Promise.all([AsyncStorage.getItem(this._storageSuffix), AsyncStorage.getItem(this.options.unsentKey), AsyncStorage.getItem(this.options.unsentIdentifyKey)]).then(function (values) {
        if (values[0]) {
          var cookieData = JSON.parse(values[0]);

          if (cookieData) {
            _loadCookieDataProps(_this, cookieData);
          }
        }

        if (_this.options.saveEvents) {
          _this._unsentEvents = _this._parseSavedUnsentEventsString(values[1]).concat(_this._unsentEvents);
          _this._unsentIdentifys = _this._parseSavedUnsentEventsString(values[2]).concat(_this._unsentIdentifys);
        }

        if (DeviceInfo) {
          Promise.all([DeviceInfo.getCarrier(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getUniqueId()]).then(function (values) {
            _this.deviceInfo = {
              carrier: values[0],
              model: values[1],
              manufacturer: values[2]
            };
            initFromStorage(values[3]);

            _this.runQueuedFunctions();

            if (type(opt_callback) === 'function') {
              opt_callback(_this);
            }
          }).catch(function (err) {
            _this.options.onError(err);
          });
        } else {
          initFromStorage();

          _this.runQueuedFunctions();
        }
      }).catch(function (err) {
        _this.options.onError(err);
      });
    } else {
      if (this.options.saveEvents) {
        this._unsentEvents = this._loadSavedUnsentEvents(this.options.unsentKey).concat(this._unsentEvents);
        this._unsentIdentifys = this._loadSavedUnsentEvents(this.options.unsentIdentifyKey).concat(this._unsentIdentifys);
      }

      initFromStorage();
      this.runQueuedFunctions();

      if (type(opt_callback) === 'function') {
        opt_callback(this);
      }
    }
  } catch (err) {
    utils.log.error(err);
    this.options.onError(err);
  }
};
/**
 * @private
 */


AmplitudeClient.prototype._trackParamsAndReferrer = function _trackParamsAndReferrer() {
  if (this.options.includeUtm) {
    this._initUtmData();
  }

  if (this.options.includeReferrer) {
    this._saveReferrer(this._getReferrer());
  }

  if (this.options.includeGclid) {
    this._saveGclid(this._getUrlParams());
  }
};
/**
 * Parse and validate user specified config values and overwrite existing option value
 * DEFAULT_OPTIONS provides list of all config keys that are modifiable, as well as expected types for values
 * @private
 */


var _parseConfig = function _parseConfig(options, config) {
  if (type(config) !== 'object') {
    return;
  } // validates config value is defined, is the correct type, and some additional value sanity checks


  var parseValidateAndLoad = function parseValidateAndLoad(key) {
    if (!options.hasOwnProperty(key)) {
      return; // skip bogus config values
    }

    var inputValue = config[key];
    var expectedType = type(options[key]);

    if (!utils.validateInput(inputValue, key + ' option', expectedType)) {
      return;
    }

    if (expectedType === 'boolean') {
      options[key] = !!inputValue;
    } else if (expectedType === 'string' && !utils.isEmptyString(inputValue) || expectedType === 'number' && inputValue > 0) {
      options[key] = inputValue;
    } else if (expectedType === 'object') {
      _parseConfig(options[key], inputValue);
    }
  };

  for (var key in config) {
    if (config.hasOwnProperty(key)) {
      parseValidateAndLoad(key);
    }
  }
};
/**
 * Run functions queued up by proxy loading snippet
 * @private
 */


AmplitudeClient.prototype.runQueuedFunctions = function () {
  var queue = this._q;
  this._q = [];

  for (var i = 0; i < queue.length; i++) {
    var fn = this[queue[i][0]];

    if (type(fn) === 'function') {
      fn.apply(this, queue[i].slice(1));
    }
  }
};
/**
 * Check that the apiKey is set before calling a function. Logs a warning message if not set.
 * @private
 */


AmplitudeClient.prototype._apiKeySet = function _apiKeySet(methodName) {
  if (utils.isEmptyString(this.options.apiKey)) {
    utils.log.error('Invalid apiKey. Please set a valid apiKey with init() before calling ' + methodName);
    return false;
  }

  return true;
};
/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */


AmplitudeClient.prototype._loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEventsString = this._getFromStorage(localStorage$1, unsentKey);

  var unsentEvents = this._parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey);

  this._setInStorage(localStorage$1, unsentKey, JSON.stringify(unsentEvents));

  return unsentEvents;
};
/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */


AmplitudeClient.prototype._parseSavedUnsentEventsString = function _parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey) {
  if (utils.isEmptyString(savedUnsentEventsString)) {
    return []; // new app, does not have any saved events
  }

  if (type(savedUnsentEventsString) === 'string') {
    try {
      var events = JSON.parse(savedUnsentEventsString);

      if (type(events) === 'array') {
        // handle case where JSON dumping of unsent events is corrupted
        return events;
      }
    } catch (e) {}
  }

  utils.log.error('Unable to load ' + unsentKey + ' events. Restart with a new empty queue.');
  return [];
};
/**
 * Returns true if a new session was created during initialization, otherwise false.
 * @public
 * @return {boolean} Whether a new session was created during initialization.
 */


AmplitudeClient.prototype.isNewSession = function isNewSession() {
  return this._newSession;
};
/**
 * Store callbacks to call after init
 * @private
 */


AmplitudeClient.prototype.onInit = function (callback) {
  if (this._isInitialized) {
    callback();
  } else {
    this._onInit.push(callback);
  }
};
/**
 * Returns the id of the current session.
 * @public
 * @return {number} Id of the current session.
 */


AmplitudeClient.prototype.getSessionId = function getSessionId() {
  return this._sessionId;
};
/**
 * Increments the eventId and returns it.
 * @private
 */


AmplitudeClient.prototype.nextEventId = function nextEventId() {
  this._eventId++;
  return this._eventId;
};
/**
 * Increments the identifyId and returns it.
 * @private
 */


AmplitudeClient.prototype.nextIdentifyId = function nextIdentifyId() {
  this._identifyId++;
  return this._identifyId;
};
/**
 * Increments the sequenceNumber and returns it.
 * @private
 */


AmplitudeClient.prototype.nextSequenceNumber = function nextSequenceNumber() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};
/**
 * Returns the total count of unsent events and identifys
 * @private
 */


AmplitudeClient.prototype._unsentCount = function _unsentCount() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};
/**
 * Send events if ready. Returns true if events are sent.
 * @private
 */


AmplitudeClient.prototype._sendEventsIfReady = function _sendEventsIfReady(callback) {
  if (this._unsentCount() === 0) {
    return false;
  } // if batching disabled, send any unsent events immediately


  if (!this.options.batchEvents) {
    this.sendEvents(callback);
    return true;
  } // if batching enabled, check if min threshold met for batch size


  if (this._unsentCount() >= this.options.eventUploadThreshold) {
    this.sendEvents(callback);
    return true;
  } // otherwise schedule an upload after 30s


  if (!this._updateScheduled) {
    // make sure we only schedule 1 upload
    this._updateScheduled = true;
    setTimeout(function () {
      this._updateScheduled = false;
      this.sendEvents();
    }.bind(this), this.options.eventUploadPeriodMillis);
  }

  return false; // an upload was scheduled, no events were uploaded
};
/**
 * Helper function to fetch values from storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */


AmplitudeClient.prototype._getFromStorage = function _getFromStorage(storage, key) {
  return storage.getItem(key + this._storageSuffix);
};
/**
 * Helper function to set values in storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */


AmplitudeClient.prototype._setInStorage = function _setInStorage(storage, key, value) {
  storage.setItem(key + this._storageSuffix, value);
};

var _upgradeCookieData = function _upgradeCookieData(scope) {
  // skip if already migrated to 4.10+
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);

  if (type(cookieData) === 'object') {
    return;
  } // skip if already migrated to 2.70+


  cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);

  if (type(cookieData) === 'object' && cookieData.deviceId && cookieData.sessionId && cookieData.lastEventTime) {
    return;
  }

  var _getAndRemoveFromLocalStorage = function _getAndRemoveFromLocalStorage(key) {
    var value = localStorage$1.getItem(key);
    localStorage$1.removeItem(key);
    return value;
  }; // in v2.6.0, deviceId, userId, optOut was migrated to localStorage with keys + first 6 char of apiKey


  var apiKeySuffix = type(scope.options.apiKey) === 'string' && '_' + scope.options.apiKey.slice(0, 6) || '';

  var localStorageDeviceId = _getAndRemoveFromLocalStorage(Constants.DEVICE_ID + apiKeySuffix);

  var localStorageUserId = _getAndRemoveFromLocalStorage(Constants.USER_ID + apiKeySuffix);

  var localStorageOptOut = _getAndRemoveFromLocalStorage(Constants.OPT_OUT + apiKeySuffix);

  if (localStorageOptOut !== null && localStorageOptOut !== undefined) {
    localStorageOptOut = String(localStorageOptOut) === 'true'; // convert to boolean
  } // pre-v2.7.0 event and session meta-data was stored in localStorage. move to cookie for sub-domain support


  var localStorageSessionId = parseInt(_getAndRemoveFromLocalStorage(Constants.SESSION_ID));
  var localStorageLastEventTime = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_EVENT_TIME));
  var localStorageEventId = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_EVENT_ID));
  var localStorageIdentifyId = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_IDENTIFY_ID));
  var localStorageSequenceNumber = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_SEQUENCE_NUMBER));

  var _getFromCookie = function _getFromCookie(key) {
    return type(cookieData) === 'object' && cookieData[key];
  };

  scope.options.deviceId = _getFromCookie('deviceId') || localStorageDeviceId;
  scope.options.userId = _getFromCookie('userId') || localStorageUserId;
  scope._sessionId = _getFromCookie('sessionId') || localStorageSessionId || scope._sessionId;
  scope._lastEventTime = _getFromCookie('lastEventTime') || localStorageLastEventTime || scope._lastEventTime;
  scope._eventId = _getFromCookie('eventId') || localStorageEventId || scope._eventId;
  scope._identifyId = _getFromCookie('identifyId') || localStorageIdentifyId || scope._identifyId;
  scope._sequenceNumber = _getFromCookie('sequenceNumber') || localStorageSequenceNumber || scope._sequenceNumber; // optOut is a little trickier since it is a boolean

  scope.options.optOut = localStorageOptOut || false;

  if (cookieData && cookieData.optOut !== undefined && cookieData.optOut !== null) {
    scope.options.optOut = String(cookieData.optOut) === 'true';
  }

  _saveCookieData(scope);
};
/**
 * Fetches deviceId, userId, event meta data from amplitude cookie
 * @private
 */


var _loadCookieData = function _loadCookieData(scope) {
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);

  if (type(cookieData) === 'object') {
    _loadCookieDataProps(scope, cookieData);
  } else {
    var legacyCookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);

    if (type(legacyCookieData) === 'object') {
      scope.cookieStorage.remove(scope.options.cookieName + scope._legacyStorageSuffix);

      _loadCookieDataProps(scope, legacyCookieData);
    }
  }
};

var _loadCookieDataProps = function _loadCookieDataProps(scope, cookieData) {
  if (cookieData.deviceId) {
    scope.options.deviceId = cookieData.deviceId;
  }

  if (cookieData.userId) {
    scope.options.userId = cookieData.userId;
  }

  if (cookieData.optOut !== null && cookieData.optOut !== undefined) {
    // Do not clobber config opt out value if cookieData has optOut as false
    if (cookieData.optOut !== false) {
      scope.options.optOut = cookieData.optOut;
    }
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
};
/**
 * Saves deviceId, userId, event meta data to amplitude cookie
 * @private
 */


var _saveCookieData = function _saveCookieData(scope) {
  var cookieData = {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    optOut: scope.options.optOut,
    sessionId: scope._sessionId,
    lastEventTime: scope._lastEventTime,
    eventId: scope._eventId,
    identifyId: scope._identifyId,
    sequenceNumber: scope._sequenceNumber
  };

  if (AsyncStorage) {
    AsyncStorage.setItem(scope._storageSuffix, JSON.stringify(cookieData));
  }

  scope.cookieStorage.set(scope.options.cookieName + scope._storageSuffix, cookieData);
};
/**
 * Parse the utm properties out of cookies and query for adding to user properties.
 * @private
 */


AmplitudeClient.prototype._initUtmData = function _initUtmData(queryParams, cookieParams) {
  queryParams = queryParams || this._getUrlParams();
  cookieParams = cookieParams || this.cookieStorage.get('__utmz');
  var utmProperties = getUtmData(cookieParams, queryParams);

  _sendParamsReferrerUserProperties(this, utmProperties);
};
/**
 * Unset the utm params from the Amplitude instance and update the identify.
 * @private
 */


AmplitudeClient.prototype._unsetUTMParams = function _unsetUTMParams() {
  var identify = new Identify();
  identify.unset(Constants.REFERRER);
  identify.unset(Constants.UTM_SOURCE);
  identify.unset(Constants.UTM_MEDIUM);
  identify.unset(Constants.UTM_CAMPAIGN);
  identify.unset(Constants.UTM_TERM);
  identify.unset(Constants.UTM_CONTENT);
  this.identify(identify);
};
/**
 * The calling function should determine when it is appropriate to send these user properties. This function
 * will no longer contain any session storage checking logic.
 * @private
 */


var _sendParamsReferrerUserProperties = function _sendParamsReferrerUserProperties(scope, userProperties) {
  if (type(userProperties) !== 'object' || Object.keys(userProperties).length === 0) {
    return;
  } // setOnce the initial user properties


  var identify = new Identify();

  for (var key in userProperties) {
    if (userProperties.hasOwnProperty(key)) {
      identify.setOnce('initial_' + key, userProperties[key]);
      identify.set(key, userProperties[key]);
    }
  }

  scope.identify(identify);
};
/**
 * @private
 */


AmplitudeClient.prototype._getReferrer = function _getReferrer() {
  return document.referrer;
};
/**
 * @private
 */


AmplitudeClient.prototype._getUrlParams = function _getUrlParams() {
  return location.search;
};
/**
 * Try to fetch Google Gclid from url params.
 * @private
 */


AmplitudeClient.prototype._saveGclid = function _saveGclid(urlParams) {
  var gclid = utils.getQueryParam('gclid', urlParams);

  if (utils.isEmptyString(gclid)) {
    return;
  }

  var gclidProperties = {
    'gclid': gclid
  };

  _sendParamsReferrerUserProperties(this, gclidProperties);
};
/**
 * Try to fetch Amplitude device id from url params.
 * @private
 */


AmplitudeClient.prototype._getDeviceIdFromUrlParam = function _getDeviceIdFromUrlParam(urlParams) {
  return utils.getQueryParam(Constants.AMP_DEVICE_ID_PARAM, urlParams);
};
/**
 * Parse the domain from referrer info
 * @private
 */


AmplitudeClient.prototype._getReferringDomain = function _getReferringDomain(referrer) {
  if (utils.isEmptyString(referrer)) {
    return null;
  }

  var parts = referrer.split('/');

  if (parts.length >= 3) {
    return parts[2];
  }

  return null;
};
/**
 * Fetch the referrer information, parse the domain and send.
 * Since user properties are propagated on the server, only send once per session, don't need to send with every event
 * @private
 */


AmplitudeClient.prototype._saveReferrer = function _saveReferrer(referrer) {
  if (utils.isEmptyString(referrer)) {
    return;
  }

  var referrerInfo = {
    'referrer': referrer,
    'referring_domain': this._getReferringDomain(referrer)
  };

  _sendParamsReferrerUserProperties(this, referrerInfo);
};
/**
 * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
 * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
 * @private
 */


AmplitudeClient.prototype.saveEvents = function saveEvents() {
  try {
    if (AsyncStorage) {
      AsyncStorage.setItem(this.options.unsentKey, JSON.stringify(this._unsentEvents));
    } else {
      this._setInStorage(localStorage$1, this.options.unsentKey, JSON.stringify(this._unsentEvents));
    }
  } catch (e) {}

  try {
    if (AsyncStorage) {
      AsyncStorage.setItem(this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
    } else {
      this._setInStorage(localStorage$1, this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
    }
  } catch (e) {}
};
/**
 * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
 * @public
 * @param {string} domain to set.
 * @example amplitudeClient.setDomain('.amplitude.com');
 */


AmplitudeClient.prototype.setDomain = function setDomain(domain) {
  if (!utils.validateInput(domain, 'domain', 'string')) {
    return;
  }

  try {
    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      secure: this.options.secureCookie,
      domain: domain
    });
    this.options.domain = this.cookieStorage.options().domain;

    _loadCookieData(this);

    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};
/**
 * Sets an identifier for the current user.
 * @public
 * @param {string} userId - identifier to set. Can be null.
 * @example amplitudeClient.setUserId('joe@gmail.com');
 */


AmplitudeClient.prototype.setUserId = function setUserId(userId) {
  try {
    this.options.userId = userId !== undefined && userId !== null && '' + userId || null;

    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};
/**
 * Add user to a group or groups. You need to specify a groupType and groupName(s).
 * For example you can group people by their organization.
 * In that case groupType is "orgId" and groupName would be the actual ID(s).
 * groupName can be a string or an array of strings to indicate a user in multiple gruups.
 * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
 * Note: this will also set groupType: groupName as a user property.
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information.
 * @public
 * @param {string} groupType - the group type (ex: orgId)
 * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
 * @example amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.
 */


AmplitudeClient.prototype.setGroup = function (groupType, groupName) {
  if (!this._apiKeySet('setGroup()') || !utils.validateInput(groupType, 'groupType', 'string') || utils.isEmptyString(groupType)) {
    return;
  }

  var groups = {};
  groups[groupType] = groupName;
  var identify = new Identify().set(groupType, groupName);

  this._logEvent(Constants.IDENTIFY_EVENT, null, null, identify.userPropertiesOperations, groups, null, null, null);
};
/**
 * Sets whether to opt current user out of tracking.
 * @public
 * @param {boolean} enable - if true then no events will be logged or sent.
 * @example: amplitude.setOptOut(true);
 */


AmplitudeClient.prototype.setOptOut = function setOptOut(enable) {
  if (!utils.validateInput(enable, 'enable', 'boolean')) {
    return;
  }

  try {
    this.options.optOut = enable;

    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.setSessionId = function setSessionId(sessionId) {
  if (!utils.validateInput(sessionId, 'sessionId', 'number')) {
    return;
  }

  try {
    this._sessionId = sessionId;

    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.resetSessionId = function resetSessionId() {
  this.setSessionId(new Date().getTime());
};
/**
  * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
  * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
  * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
  * This uses src/uuid.js to regenerate the deviceId.
  * @public
  */


AmplitudeClient.prototype.regenerateDeviceId = function regenerateDeviceId() {
  this.setDeviceId(uuid() + 'R');
};
/**
  * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
  * (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
  * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
  * @public
  * @param {string} deviceId - custom deviceId for current user.
  * @example amplitudeClient.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
  */


AmplitudeClient.prototype.setDeviceId = function setDeviceId(deviceId) {
  if (!utils.validateInput(deviceId, 'deviceId', 'string')) {
    return;
  }

  try {
    if (!utils.isEmptyString(deviceId)) {
      this.options.deviceId = '' + deviceId;

      _saveCookieData(this);
    }
  } catch (e) {
    utils.log.error(e);
  }
};
/**
 * Sets user properties for the current user.
 * @public
 * @param {object} - object with string keys and values for the user properties to set.
 * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
 * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
 * @example amplitudeClient.setUserProperties({'gender': 'female', 'sign_up_complete': true})
 */


AmplitudeClient.prototype.setUserProperties = function setUserProperties(userProperties) {
  if (this._pendingReadStorage) {
    return this._q.push(['identify', userProperties]);
  }

  if (!this._apiKeySet('setUserProperties()') || !utils.validateInput(userProperties, 'userProperties', 'object')) {
    return;
  } // sanitize the userProperties dict before converting into identify


  var sanitized = utils.truncate(utils.validateProperties(userProperties));

  if (Object.keys(sanitized).length === 0) {
    return;
  } // convert userProperties into an identify call


  var identify = new Identify();

  for (var property in sanitized) {
    if (sanitized.hasOwnProperty(property)) {
      identify.set(property, sanitized[property]);
    }
  }

  this.identify(identify);
};
/**
 * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
 * @public
 * @example amplitudeClient.clearUserProperties();
 */


AmplitudeClient.prototype.clearUserProperties = function clearUserProperties() {
  if (!this._apiKeySet('clearUserProperties()')) {
    return;
  }

  var identify = new Identify();
  identify.clearAll();
  this.identify(identify);
};
/**
 * Applies the proxied functions on the proxied object to an instance of the real object.
 * Used to convert proxied Identify and Revenue objects.
 * @private
 */


var _convertProxyObjectToRealObject = function _convertProxyObjectToRealObject(instance, proxy) {
  for (var i = 0; i < proxy._q.length; i++) {
    var fn = instance[proxy._q[i][0]];

    if (type(fn) === 'function') {
      fn.apply(instance, proxy._q[i].slice(1));
    }
  }

  return instance;
};
/**
 * Send an identify call containing user property operations to Amplitude servers.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
 * for more information on the Identify API and user property operations.
 * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
 * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
 * Note: the server response code and response body from the identify event upload are passed to the callback function.
 * @example
 * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
 * amplitude.identify(identify);
 */


AmplitudeClient.prototype.identify = function (identify_obj, opt_callback) {
  if (this._pendingReadStorage) {
    return this._q.push(['identify', identify_obj, opt_callback]);
  }

  if (!this._apiKeySet('identify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'API key is not set'
      });
    }

    return;
  } // if identify input is a proxied object created by the async loading snippet, convert it into an identify object


  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(Constants.IDENTIFY_EVENT, null, null, identify_obj.userPropertiesOperations, null, null, null, opt_callback);
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', {
          reason: 'No user property operations'
        });
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));

    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid identify input type'
      });
    }
  }
};

AmplitudeClient.prototype.groupIdentify = function (group_type, group_name, identify_obj, opt_callback) {
  if (this._pendingReadStorage) {
    return this._q.push(['groupIdentify', group_type, group_name, identify_obj, opt_callback]);
  }

  if (!this._apiKeySet('groupIdentify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'API key is not set'
      });
    }

    return;
  }

  if (!utils.validateInput(group_type, 'group_type', 'string') || utils.isEmptyString(group_type)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid group type'
      });
    }

    return;
  }

  if (group_name === null || group_name === undefined) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid group name'
      });
    }

    return;
  } // if identify input is a proxied object created by the async loading snippet, convert it into an identify object


  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(Constants.GROUP_IDENTIFY_EVENT, null, null, null, _defineProperty({}, group_type, group_name), identify_obj.userPropertiesOperations, null, opt_callback);
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', {
          reason: 'No group property operations'
        });
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));

    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid identify input type'
      });
    }
  }
};
/**
 * Set a versionName for your application.
 * @public
 * @param {string} versionName - The version to set for your application.
 * @example amplitudeClient.setVersionName('1.12.3');
 */


AmplitudeClient.prototype.setVersionName = function setVersionName(versionName) {
  if (!utils.validateInput(versionName, 'versionName', 'string')) {
    return;
  }

  this.options.versionName = versionName;
};
/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 * @private
 */


AmplitudeClient.prototype._logEvent = function _logEvent(eventType, eventProperties, apiProperties, userProperties, groups, groupProperties, timestamp, callback) {
  {
    _loadCookieData(this); // reload cookie before each log event to sync event meta-data between windows and tabs

  }

  if (!eventType) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'Missing eventType'
      });
    }

    return;
  }

  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'optOut is set to true'
      });
    }

    return;
  }

  try {
    var eventId;

    if (eventType === Constants.IDENTIFY_EVENT || eventType === Constants.GROUP_IDENTIFY_EVENT) {
      eventId = this.nextIdentifyId();
    } else {
      eventId = this.nextEventId();
    }

    var sequenceNumber = this.nextSequenceNumber();
    var eventTime = type(timestamp) === 'number' ? timestamp : new Date().getTime();

    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }

    this._lastEventTime = eventTime;

    _saveCookieData(this);

    var osName = this._ua.browser.name;
    var osVersion = this._ua.browser.major;
    var deviceModel = this._ua.os.name;
    var deviceManufacturer;
    var carrier;

    userProperties = userProperties || {};

    var trackingOptions = _objectSpread({}, this._apiPropertiesTrackingOptions);

    apiProperties = _objectSpread({}, apiProperties || {}, trackingOptions);
    eventProperties = eventProperties || {};
    groups = groups || {};
    groupProperties = groupProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: this._sessionId || -1,
      event_type: eventType,
      version_name: _shouldTrackField(this, 'version_name') ? this.options.versionName || null : null,
      platform: _shouldTrackField(this, 'platform') ? this.options.platform : null,
      os_name: _shouldTrackField(this, 'os_name') ? osName || null : null,
      os_version: _shouldTrackField(this, 'os_version') ? osVersion || null : null,
      device_model: _shouldTrackField(this, 'device_model') ? deviceModel || null : null,
      device_manufacturer: _shouldTrackField(this, 'device_manufacturer') ? deviceManufacturer || null : null,
      language: _shouldTrackField(this, 'language') ? this.options.language : null,
      carrier: _shouldTrackField(this, 'carrier') ? carrier || null : null,
      api_properties: apiProperties,
      event_properties: utils.truncate(utils.validateProperties(eventProperties)),
      user_properties: utils.truncate(utils.validateProperties(userProperties)),
      uuid: uuid(),
      library: {
        name: 'amplitude-js',
        version: version
      },
      sequence_number: sequenceNumber,
      // for ordering events and identifys
      groups: utils.truncate(utils.validateGroups(groups)),
      group_properties: utils.truncate(utils.validateProperties(groupProperties)),
      user_agent: this._userAgent
    };

    if (eventType === Constants.IDENTIFY_EVENT || eventType === Constants.GROUP_IDENTIFY_EVENT) {
      this._unsentIdentifys.push(event);

      this._limitEventsQueued(this._unsentIdentifys);
    } else {
      this._unsentEvents.push(event);

      this._limitEventsQueued(this._unsentEvents);
    }

    if (this.options.saveEvents) {
      this.saveEvents();
    }

    if (!this._sendEventsIfReady(callback) && type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'No events to send or upload queued'
      });
    }

    return eventId;
  } catch (e) {
    utils.log.error(e);
  }
};

var _shouldTrackField = function _shouldTrackField(scope, field) {
  return !!scope.options.trackingOptions[field];
};

var _generateApiPropertiesTrackingConfig = function _generateApiPropertiesTrackingConfig(scope) {
  // to limit size of config payload, only send fields that have been disabled
  var fields = ['city', 'country', 'dma', 'ip_address', 'region'];
  var config = {};

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];

    if (!_shouldTrackField(scope, field)) {
      config[field] = false;
    }
  }

  return config;
};
/**
 * Remove old events from the beginning of the array if too many have accumulated. Default limit is 1000 events.
 * @private
 */


AmplitudeClient.prototype._limitEventsQueued = function _limitEventsQueued(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};
/**
 * This is the callback for logEvent and identify calls. It gets called after the event/identify is uploaded,
 * and the server response code and response body from the upload request are passed to the callback function.
 * @callback Amplitude~eventCallback
 * @param {number} responseCode - Server response code for the event / identify upload request.
 * @param {string} responseBody - Server response body for the event / identify upload request.
 */

/**
 * Log an event with eventType and eventProperties
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */


AmplitudeClient.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
  if (this._pendingReadStorage) {
    return this._q.push(['logEvent', eventType, eventProperties, opt_callback]);
  }

  return this.logEventWithTimestamp(eventType, eventProperties, null, opt_callback);
};
/**
 * Log an event with eventType and eventProperties and a custom timestamp
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {number} timestamp - (optional) the custom timestamp as milliseconds since epoch.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */


AmplitudeClient.prototype.logEventWithTimestamp = function logEvent(eventType, eventProperties, timestamp, opt_callback) {
  if (this._pendingReadStorage) {
    return this._q.push(['logEventWithTimestamp', eventType, eventProperties, timestamp, opt_callback]);
  }

  if (!this._apiKeySet('logEvent()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'API key not set'
      });
    }

    return -1;
  }

  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid type for eventType'
      });
    }

    return -1;
  }

  if (utils.isEmptyString(eventType)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Missing eventType'
      });
    }

    return -1;
  }

  return this._logEvent(eventType, eventProperties, null, null, null, null, timestamp, opt_callback);
};
/**
 * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
 * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
 * (unless you explicitly set it with setGroup).
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information
 * about groups and Count by Distinct on the Amplitude platform.
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
 * groupName can be a string or an array of strings.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEventWithGroups('Clicked Button', null, {'orgId': 24});
 */


AmplitudeClient.prototype.logEventWithGroups = function (eventType, eventProperties, groups, opt_callback) {
  if (this._pendingReadStorage) {
    return this._q.push(['logEventWithGroups', eventType, eventProperties, groups, opt_callback]);
  }

  if (!this._apiKeySet('logEventWithGroups()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'API key not set'
      });
    }

    return -1;
  }

  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {
        reason: 'Invalid type for eventType'
      });
    }

    return -1;
  }

  return this._logEvent(eventType, eventProperties, null, null, groups, null, null, opt_callback);
};
/**
 * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
 * revenueType and event properties.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue}
 * for more information on the Revenue interface and logging revenue.
 * @public
 * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */


AmplitudeClient.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
  if (!this._apiKeySet('logRevenueV2()')) {
    return;
  } // if revenue input is a proxied object created by the async loading snippet, convert it into an revenue object


  if (type(revenue_obj) === 'object' && revenue_obj.hasOwnProperty('_q')) {
    revenue_obj = _convertProxyObjectToRealObject(new Revenue(), revenue_obj);
  }

  if (revenue_obj instanceof Revenue) {
    // only send if revenue is valid
    if (revenue_obj && revenue_obj._isValidRevenue()) {
      return this.logEvent(Constants.REVENUE_EVENT, revenue_obj._toJSONObject());
    }
  } else {
    utils.log.error('Invalid revenue input type. Expected Revenue object but saw ' + type(revenue_obj));
  }
};
/**
 * Remove events in storage with event ids up to and including maxEventId.
 * @private
 */


AmplitudeClient.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
  _removeEvents(this, '_unsentEvents', maxEventId);

  _removeEvents(this, '_unsentIdentifys', maxIdentifyId);
};
/**
 * Helper function to remove events up to maxId from a single queue.
 * Does a true filter in case events get out of order or old events are removed.
 * @private
 */


var _removeEvents = function _removeEvents(scope, eventQueue, maxId) {
  if (maxId < 0) {
    return;
  }

  var filteredEvents = [];

  for (var i = 0; i < scope[eventQueue].length || 0; i++) {
    if (scope[eventQueue][i].event_id > maxId) {
      filteredEvents.push(scope[eventQueue][i]);
    }
  }

  scope[eventQueue] = filteredEvents;
};
/**
 * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
 * If batchEvents is true, then events are only sent when batch criterias are met.
 * @private
 * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
 * Note the server response code and response body are passed to the callback as input arguments.
 */


AmplitudeClient.prototype.sendEvents = function sendEvents(callback) {
  if (!this._apiKeySet('sendEvents()')) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'API key not set'
      });
    }

    return;
  }

  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'optOut is set to true'
      });
    }

    return;
  }

  if (this._unsentCount() === 0) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'No events to send'
      });
    }

    return;
  }

  if (this._sending) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {
        reason: 'Request already in progress. Events will be sent once this request is complete'
      });
    }

    return;
  }

  this._sending = true;
  var protocol = this.options.forceHttps ? 'https' : 'https:' === window.location.protocol ? 'https' : 'http';
  var url = protocol + '://' + this.options.apiEndpoint; // fetch events to send

  var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);

  var mergedEvents = this._mergeEventsAndIdentifys(numEvents);

  var maxEventId = mergedEvents.maxEventId;
  var maxIdentifyId = mergedEvents.maxIdentifyId;
  var events = JSON.stringify(mergedEvents.eventsToSend);
  var uploadTime = new Date().getTime();
  var data = {
    client: this.options.apiKey,
    e: events,
    v: Constants.API_VERSION,
    upload_time: uploadTime,
    checksum: md5(Constants.API_VERSION + this.options.apiKey + events + uploadTime)
  };
  var scope = this;
  new Request(url, data).send(function (status, response) {
    scope._sending = false;

    try {
      if (status === 200 && response === 'success') {
        scope.removeEvents(maxEventId, maxIdentifyId); // Update the event cache after the removal of sent events.

        if (scope.options.saveEvents) {
          scope.saveEvents();
        } // Send more events if any queued during previous send.


        if (!scope._sendEventsIfReady(callback) && type(callback) === 'function') {
          callback(status, response);
        } // handle payload too large

      } else if (status === 413) {
        // utils.log('request too large');
        // Can't even get this one massive event through. Drop it, even if it is an identify.
        if (scope.options.uploadBatchSize === 1) {
          scope.removeEvents(maxEventId, maxIdentifyId);
        } // The server complained about the length of the request. Backoff and try again.


        scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
        scope.sendEvents(callback);
      } else if (type(callback) === 'function') {
        // If server turns something like a 400
        callback(status, response);
      }
    } catch (e) {// utils.log('failed upload');
    }
  });
};
/**
 * Merge unsent events and identifys together in sequential order based on their sequence number, for uploading.
 * @private
 */


AmplitudeClient.prototype._mergeEventsAndIdentifys = function _mergeEventsAndIdentifys(numEvents) {
  // coalesce events from both queues
  var eventsToSend = [];
  var eventIndex = 0;
  var maxEventId = -1;
  var identifyIndex = 0;
  var maxIdentifyId = -1;

  while (eventsToSend.length < numEvents) {
    var event;
    var noIdentifys = identifyIndex >= this._unsentIdentifys.length;
    var noEvents = eventIndex >= this._unsentEvents.length; // case 0: no events or identifys left
    // note this should not happen, this means we have less events and identifys than expected

    if (noEvents && noIdentifys) {
      utils.log.error('Merging Events and Identifys, less events and identifys than expected');
      break;
    } // case 1: no identifys - grab from events
    else if (noIdentifys) {
        event = this._unsentEvents[eventIndex++];
        maxEventId = event.event_id; // case 2: no events - grab from identifys
      } else if (noEvents) {
        event = this._unsentIdentifys[identifyIndex++];
        maxIdentifyId = event.event_id; // case 3: need to compare sequence numbers
      } else {
        // events logged before v2.5.0 won't have a sequence number, put those first
        if (!('sequence_number' in this._unsentEvents[eventIndex]) || this._unsentEvents[eventIndex].sequence_number < this._unsentIdentifys[identifyIndex].sequence_number) {
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
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */


AmplitudeClient.prototype.__VERSION__ = version;

/**
 * Amplitude SDK API - instance manager.
 * Function calls directly on amplitude have been deprecated. Please call methods on the default shared instance: amplitude.getInstance() instead.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#300-update-and-logging-events-to-multiple-amplitude-apps} for more information about this change.
 * @constructor Amplitude
 * @public
 * @example var amplitude = new Amplitude();
 */

var Amplitude = function Amplitude() {
  this.options = _objectSpread({}, DEFAULT_OPTIONS);
  this._q = [];
  this._instances = {}; // mapping of instance names to instances
};

Amplitude.prototype.Identify = Identify;
Amplitude.prototype.Revenue = Revenue;

Amplitude.prototype.getInstance = function getInstance(instance) {
  instance = utils.isEmptyString(instance) ? Constants.DEFAULT_INSTANCE : instance.toLowerCase();
  var client = this._instances[instance];

  if (client === undefined) {
    client = new AmplitudeClient(instance);
    this._instances[instance] = client;
  }

  return client;
};
/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */


Amplitude.prototype.__VERSION__ = version;

/* jshint expr:true */
var old = window.amplitude || {};
var newInstance = new Amplitude();
newInstance._q = old._q || [];

for (var instance in old._iq) {
  // migrate each instance's queue
  if (old._iq.hasOwnProperty(instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

export default newInstance;
