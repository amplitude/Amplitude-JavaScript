(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.amplitude = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  /**
   * Strings that have special meaning when used as an event's type
   * and have different specifications.
   */
  var SpecialEventType;
  (function (SpecialEventType) {
      SpecialEventType["IDENTIFY"] = "$identify";
  })(SpecialEventType || (SpecialEventType = {}));

  var IdentifyOperation;
  (function (IdentifyOperation) {
      // Base Operations to set values
      IdentifyOperation["SET"] = "$set";
      IdentifyOperation["SET_ONCE"] = "$setOnce";
      // Operations around modifying existing values
      IdentifyOperation["ADD"] = "$add";
      IdentifyOperation["APPEND"] = "$append";
      IdentifyOperation["PREPEND"] = "$prepend";
      IdentifyOperation["REMOVE"] = "$remove";
      // Operations around appending values *if* they aren't present
      IdentifyOperation["PREINSERT"] = "$preinsert";
      IdentifyOperation["POSTINSERT"] = "$postinsert";
      // Operations around removing properties/values
      IdentifyOperation["UNSET"] = "$unset";
      IdentifyOperation["CLEAR_ALL"] = "$clearAll";
  })(IdentifyOperation || (IdentifyOperation = {}));

  /** The default identity instance. Needs to match the default instance for the JS SDK */

  /** Console logging verbosity for the SDK. */
  var LogLevel;
  (function (LogLevel) {
      /** No logs will be generated. */
      LogLevel[LogLevel["None"] = 0] = "None";
      /** Only SDK internal errors will be logged. */
      LogLevel[LogLevel["Error"] = 1] = "Error";
      /** Information useful for debugging the SDK will be logged. */
      LogLevel[LogLevel["Warn"] = 2] = "Warn";
      /** All SDK actions will be logged. */
      LogLevel[LogLevel["Verbose"] = 3] = "Verbose";
  })(LogLevel || (LogLevel = {}));

  /** The status of an event. */
  var Status;
  (function (Status) {
      /** The status could not be determined. */
      Status["Unknown"] = "unknown";
      /** The event was skipped due to configuration or callbacks. */
      Status["Skipped"] = "skipped";
      /** The event was sent successfully. */
      Status["Success"] = "success";
      /** A user or device in the payload is currently rate limited and should try again later. */
      Status["RateLimit"] = "rate_limit";
      /** The sent payload was too large to be processed. */
      Status["PayloadTooLarge"] = "payload_too_large";
      /** The event could not be processed. */
      Status["Invalid"] = "invalid";
      /** A server-side error ocurred during submission. */
      Status["Failed"] = "failed";
  })(Status || (Status = {}));
  // tslint:disable:completed-docs
  // tslint:disable:no-unnecessary-qualifier no-namespace
  (function (Status) {
      /**
       * Converts a HTTP status code into a {@link Status}.
       *
       * @param code The HTTP response status code.
       * @returns The send status or {@link Status.Unknown}.
       */
      function fromHttpCode(code) {
          if (code >= 200 && code < 300) {
              return Status.Success;
          }
          if (code === 429) {
              return Status.RateLimit;
          }
          if (code === 413) {
              return Status.PayloadTooLarge;
          }
          if (code >= 400 && code < 500) {
              return Status.Invalid;
          }
          if (code >= 500) {
              return Status.Failed;
          }
          return Status.Unknown;
      }
      Status.fromHttpCode = fromHttpCode;
  })(Status || (Status = {}));

  /** The Response to expect if a request might have been sent but it was skipped
   *  e.g. no events to flush, user has opted out and nothing should be sent.
   */
  var SKIPPED_RESPONSE = {
      status: Status.Skipped,
      statusCode: 0,
  };

  /**
   * Checks whether we're in a Node.js environment
   *
   * @returns Answer to given question
   */
  function isNodeEnv() {
      var _a;
      return typeof process === 'object' && ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node) !== undefined;
  }
  /**
   * Checks whether we're in a browser environment
   *
   * @returns Answer to given question
   */
  function isBrowserEnv() {
      return typeof window === 'object' && (window === null || window === void 0 ? void 0 : window.document) !== undefined;
  }
  var fallbackGlobalObject = {};
  /**
   * Safely get global scope object
   *
   * @returns Global scope object
   */
  var getGlobalObject = function () {
      return isNodeEnv()
          ? global
          : typeof window !== 'undefined'
              ? window
              : typeof self !== 'undefined'
                  ? self
                  : fallbackGlobalObject;
  };
  var getGlobalAmplitudeNamespace = function () {
      var global = getGlobalObject();
      global.__AMPLITUDE__ = global.__AMPLITUDE__ || {};
      return global.__AMPLITUDE__;
  };
  /**
   * Fixes browser edge case where Prototype.js injects Array.prototype.toJSON and breaks the built-in JSON.stringify()
   *
   * @returns true if Array.prototype.toJSON was deleted, false if not
   */
  var prototypeJsFix = function () {
      var _a;
      if (isBrowserEnv()) {
          var augmentedWindow = window;
          var augmentedArray = Array;
          if (augmentedWindow.Prototype !== undefined && ((_a = augmentedArray.prototype) === null || _a === void 0 ? void 0 : _a.toJSON) !== undefined) {
              delete augmentedArray.prototype.toJSON;
              return true;
          }
      }
      return false;
  };

  // TODO: Type the global constant
  var globalNamespace = getGlobalAmplitudeNamespace();
  /** Prefix for logging strings */
  var PREFIX = 'Amplitude Logger ';
  /** JSDoc */
  var Logger = /** @class */ (function () {
      /** JSDoc */
      function Logger() {
          this._logLevel = 0;
      }
      /** JSDoc */
      Logger.prototype.disable = function () {
          this._logLevel = 0;
      };
      /** JSDoc */
      Logger.prototype.enable = function (logLevel) {
          if (logLevel === void 0) { logLevel = LogLevel.Warn; }
          this._logLevel = logLevel;
      };
      /** JSDoc */
      Logger.prototype.log = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this._logLevel < LogLevel.Verbose) {
              return;
          }
          global.console.log(PREFIX + "[Log]: " + args.join(' ')); // tslint:disable-line:no-console
      };
      /** JSDoc */
      Logger.prototype.warn = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this._logLevel < LogLevel.Warn) {
              return;
          }
          global.console.warn(PREFIX + "[Warn]: " + args.join(' ')); // tslint:disable-line:no-console
      };
      /** JSDoc */
      Logger.prototype.error = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this._logLevel < LogLevel.Error) {
              return;
          }
          global.console.error(PREFIX + "[Error]: " + args.join(' ')); // tslint:disable-line:no-console
      };
      return Logger;
  }());
  // Ensure we only have a single logger instance, even if multiple versions of @amplitude/utils are being used
  var logger = globalNamespace.logger || (globalNamespace.logger = new Logger());

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
    COOKIE_TEST_PREFIX: 'amp_cookie_test',
    COOKIE_PREFIX: 'amp',
    // Storage options
    STORAGE_DEFAULT: '',
    STORAGE_COOKIES: 'cookies',
    STORAGE_NONE: 'none',
    STORAGE_LOCAL: 'localStorage',
    STORAGE_SESSION: 'sessionStorage',
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
    UTM_CONTENT: 'utm_content',
    ATTRIBUTION_EVENT: '[Amplitude] Attribution Captured'
  };

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
      input = input.replace(/[^A-Za-z0-9+/=]/g, '');

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
    if (Object.prototype.hasOwnProperty.call(logLevels, logLevelName)) {
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
    } catch (e) {// sessionStorage disabled
    }

    return false;
  }; // truncate string values in event and user properties so that request size does not get too large


  var truncate = function truncate(value) {
    if (type(value) === 'array') {
      for (var i = 0; i < value.length; i++) {
        value[i] = truncate(value[i]);
      }
    } else if (type(value) === 'object') {
      for (var key in value) {
        if (key in value) {
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
      if (!Object.prototype.hasOwnProperty.call(properties, property)) {
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
      if (!Object.prototype.hasOwnProperty.call(groups, group)) {
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
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(query);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, ' '));
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

  // A URL safe variation on the the list of Base64 characters
  var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  var base64Id = function base64Id() {
    var str = '';

    for (var i = 0; i < 22; ++i) {
      str += base64Chars.charAt(Math.floor(Math.random() * 64));
    }

    return str;
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

    if (opts.sameSite) {
      str += '; SameSite=' + opts.sameSite;
    }

    document.cookie = str;
  }; // test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly


  var areCookiesEnabled = function areCookiesEnabled() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var uid = String(new Date());

    try {
      var cookieName = Constants.COOKIE_TEST_PREFIX + base64Id();
      set(cookieName, uid, opts);

      var _areCookiesEnabled = get(cookieName + '=') === uid;

      set(cookieName, null, opts);
      return _areCookiesEnabled;
    } catch (e) {}
    /* eslint-disable-line no-empty */


    return false;
  };

  var baseCookie = {
    set: set,
    get: get,
    areCookiesEnabled: areCookiesEnabled
  };

  var getHost = function getHost(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname || location.hostname;
  };

  var topDomain = function topDomain(url) {
    var host = getHost(url);
    var parts = host.split('.');
    var levels = [];
    var cname = '_tldtest_' + base64Id();

    for (var i = parts.length - 2; i >= 0; --i) {
      levels.push(parts.slice(i).join('.'));
    }

    for (var _i = 0; _i < levels.length; ++_i) {
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

  var options = function options(opts) {
    if (arguments.length === 0) {
      return _options;
    }

    opts = opts || {};
    _options.expirationDays = opts.expirationDays;
    _options.secure = opts.secure;
    _options.sameSite = opts.sameSite;
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

  var setRaw = function setRaw(name, value) {
    try {
      baseCookie.set(_domainSpecific(name), value, _options);
      return true;
    } catch (e) {
      return false;
    }
  };

  var getRaw = function getRaw(name) {
    var nameEq = _domainSpecific(name) + '=';
    return baseCookie.get(nameEq);
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
    remove: remove,
    setRaw: setRaw,
    getRaw: getRaw
  };

  /*
   * Implement localStorage to support Firefox 2-3 and IE 5-7
   */
  var localStorage;

  {
    // test that Window.localStorage is available and works
    var windowLocalStorageAvailable = function windowLocalStorageAvailable() {
      var uid = new Date();
      var result;

      try {
        window.localStorage.setItem(uid, uid);
        result = window.localStorage.getItem(uid) === String(uid);
        window.localStorage.removeItem(uid);
        return result;
      } catch (e) {// localStorage not available
      }

      return false;
    };

    if (windowLocalStorageAvailable()) {
      localStorage = window.localStorage;
    } else if (window.globalStorage) {
      // Firefox 2-3 use globalStorage
      // See https://developer.mozilla.org/en/dom/storage#globalStorage
      try {
        localStorage = window.globalStorage[window.location.hostname];
      } catch (e) {// Something bad happened...
      }
    } else if (typeof document !== 'undefined') {
      // IE 5-7 use userData
      // See http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
      var div = document.createElement('div'),
          attrKey = 'localStorage';
      div.style.display = 'none';
      document.getElementsByTagName('head')[0].appendChild(div);

      if (div.addBehavior) {
        div.addBehavior('#default#userdata');
        localStorage = {
          length: 0,
          setItem: function setItem(k, v) {
            div.load(attrKey);

            if (!div.getAttribute(k)) {
              this.length++;
            }

            div.setAttribute(k, v);
            div.save(attrKey);
          },
          getItem: function getItem(k) {
            div.load(attrKey);
            return div.getAttribute(k);
          },
          removeItem: function removeItem(k) {
            div.load(attrKey);

            if (div.getAttribute(k)) {
              this.length--;
            }

            div.removeAttribute(k);
            div.save(attrKey);
          },
          clear: function clear() {
            div.load(attrKey);
            var i = 0;
            var attr;

            while (attr = div.XMLDocument.documentElement.attributes[i++]) {
              div.removeAttribute(attr.name);
            }

            div.save(attrKey);
            this.length = 0;
          },
          key: function key(k) {
            div.load(attrKey);
            return div.XMLDocument.documentElement.attributes[k];
          }
        };
        div.load(attrKey);
        localStorage.length = div.XMLDocument.documentElement.attributes.length;
      }
    }

    if (!localStorage) {
      /* eslint-disable no-unused-vars */
      localStorage = {
        length: 0,
        setItem: function setItem(k, v) {},
        getItem: function getItem(k) {},
        removeItem: function removeItem(k) {},
        clear: function clear() {},
        key: function key(k) {}
      };
      /* eslint-enable no-unused-vars */
    }
  }

  var localStorage$1 = localStorage;

  /*
   * Abstraction layer for cookie storage.
   * Uses cookie if available, otherwise fallback to localstorage.
   */

  var cookieStorage = function cookieStorage() {
    this.storage = null;
  };

  cookieStorage.prototype.getStorage = function () {
    if (this.storage !== null) {
      return this.storage;
    }

    if (baseCookie.areCookiesEnabled()) {
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
          /* eslint-disable-line no-empty */


          return null;
        },
        set: function set(name, value) {
          try {
            localStorage$1.setItem(keyPrefix + name, JSON.stringify(value));
            return true;
          } catch (e) {}
          /* eslint-disable-line no-empty */


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

  var _storageOptionExists;
  var storageOptionExists = (_storageOptionExists = {}, _defineProperty(_storageOptionExists, Constants.STORAGE_COOKIES, true), _defineProperty(_storageOptionExists, Constants.STORAGE_NONE, true), _defineProperty(_storageOptionExists, Constants.STORAGE_LOCAL, true), _defineProperty(_storageOptionExists, Constants.STORAGE_SESSION, true), _storageOptionExists);
  /**
   * MetadataStorage involves SDK data persistance
   * storage priority: cookies -> localStorage -> in memory
   * This priority can be overriden by setting the storage options.
   * if in localStorage, unable track users between subdomains
   * if in memory, then memory can't be shared between different tabs
   */

  var MetadataStorage =
  /*#__PURE__*/
  function () {
    function MetadataStorage(_ref) {
      var storageKey = _ref.storageKey,
          disableCookies = _ref.disableCookies,
          domain = _ref.domain,
          secure = _ref.secure,
          sameSite = _ref.sameSite,
          expirationDays = _ref.expirationDays,
          storage = _ref.storage;

      _classCallCheck(this, MetadataStorage);

      this.storageKey = storageKey;
      this.domain = domain;
      this.secure = secure;
      this.sameSite = sameSite;
      this.expirationDays = expirationDays;
      this.cookieDomain = '';

      if (storageOptionExists[storage]) {
        this.storage = storage;
      } else {
        var disableCookieStorage = disableCookies || !baseCookie.areCookiesEnabled({
          domain: this.cookieDomain,
          secure: this.secure,
          sameSite: this.sameSite,
          expirationDays: this.expirationDays
        });

        if (disableCookieStorage) {
          this.storage = Constants.STORAGE_LOCAL;
        } else {
          this.storage = Constants.STORAGE_COOKIES;
        }
      }
    }

    _createClass(MetadataStorage, [{
      key: "getCookieStorageKey",
      value: function getCookieStorageKey() {
        if (!this.domain) {
          return this.storageKey;
        }

        var suffix = this.domain.charAt(0) === '.' ? this.domain.substring(1) : this.domain;
        return "".concat(this.storageKey).concat(suffix ? "_".concat(suffix) : '');
      }
      /*
       * Data is saved as delimited values rather than JSO to minimize cookie space
       * Should not change order of the items
       */

    }, {
      key: "save",
      value: function save(_ref2) {
        var deviceId = _ref2.deviceId,
            userId = _ref2.userId,
            optOut = _ref2.optOut,
            sessionId = _ref2.sessionId,
            lastEventTime = _ref2.lastEventTime,
            eventId = _ref2.eventId,
            identifyId = _ref2.identifyId,
            sequenceNumber = _ref2.sequenceNumber;

        if (this.storage === Constants.STORAGE_NONE) {
          return;
        }

        var value = [deviceId, Base64.encode(userId || ''), // used to convert not unicode to alphanumeric since cookies only use alphanumeric
        optOut ? '1' : '', sessionId ? sessionId.toString(32) : '0', // generated when instantiated, timestamp (but re-uses session id in cookie if not expired) @TODO clients may want custom session id
        lastEventTime ? lastEventTime.toString(32) : '0', // last time an event was set
        eventId ? eventId.toString(32) : '0', identifyId ? identifyId.toString(32) : '0', sequenceNumber ? sequenceNumber.toString(32) : '0'].join('.');

        switch (this.storage) {
          case Constants.STORAGE_SESSION:
            if (window.sessionStorage) {
              window.sessionStorage.setItem(this.storageKey, value);
            }

            break;

          case Constants.STORAGE_LOCAL:
            localStorage$1.setItem(this.storageKey, value);
            break;

          case Constants.STORAGE_COOKIES:
            baseCookie.set(this.getCookieStorageKey(), value, {
              domain: this.cookieDomain,
              secure: this.secure,
              sameSite: this.sameSite,
              expirationDays: this.expirationDays
            });
            break;
        }
      }
    }, {
      key: "load",
      value: function load() {
        var str;

        if (this.storage === Constants.STORAGE_COOKIES) {
          str = baseCookie.get(this.getCookieStorageKey() + '=');
        }

        if (!str) {
          str = localStorage$1.getItem(this.storageKey);
        }

        if (!str) {
          str = window.sessionStorage && window.sessionStorage.getItem(this.storageKey);
        }

        if (!str) {
          return null;
        }

        var values = str.split('.');
        var userId = null;

        if (values[1]) {
          try {
            userId = Base64.decode(values[1]);
          } catch (e) {
            userId = null;
          }
        }

        return {
          deviceId: values[0],
          userId: userId,
          optOut: values[2] === '1',
          sessionId: parseInt(values[3], 32),
          lastEventTime: parseInt(values[4], 32),
          eventId: parseInt(values[5], 32),
          identifyId: parseInt(values[6], 32),
          sequenceNumber: parseInt(values[7], 32)
        };
      }
    }]);

    return MetadataStorage;
  }();

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
      if (!Object.prototype.hasOwnProperty.call(this.userPropertiesOperations, AMP_OP_CLEAR_ALL)) {
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
   * @param {number|string|list|boolean|object} value - A value or values to set.
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
   * @param {number|string|list|boolean|object} value - A value or values to set once.
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
    if (Object.prototype.hasOwnProperty.call(this.userPropertiesOperations, AMP_OP_CLEAR_ALL)) {
      utils.log.error('This identify already contains a $clearAll operation, skipping operation ' + operation);
      return;
    } // check that property wasn't already used in this Identify


    if (this.properties.indexOf(property) !== -1) {
      utils.log.error('User property "' + property + '" already used in this identify, skipping operation ' + operation);
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(this.userPropertiesOperations, operation)) {
      this.userPropertiesOperations[operation] = {};
    }

    this.userPropertiesOperations[operation][property] = value;
    this.properties.push(property);
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var md5 = createCommonjsModule(function (module) {
  (function ($) {

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safeAdd (x, y) {
      var lsw = (x & 0xffff) + (y & 0xffff);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff)
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bitRotateLeft (num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt))
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5cmn (q, a, b, x, s, t) {
      return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
    }
    function md5ff (a, b, c, d, x, s, t) {
      return md5cmn((b & c) | (~b & d), a, b, x, s, t)
    }
    function md5gg (a, b, c, d, x, s, t) {
      return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
    }
    function md5hh (a, b, c, d, x, s, t) {
      return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }
    function md5ii (a, b, c, d, x, s, t) {
      return md5cmn(c ^ (b | ~d), a, b, x, s, t)
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binlMD5 (x, len) {
      /* append padding */
      x[len >> 5] |= 0x80 << (len % 32);
      x[((len + 64) >>> 9 << 4) + 14] = len;

      var i;
      var olda;
      var oldb;
      var oldc;
      var oldd;
      var a = 1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d = 271733878;

      for (i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;

        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
      }
      return [a, b, c, d]
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr (input) {
      var i;
      var output = '';
      var length32 = input.length * 32;
      for (i = 0; i < length32; i += 8) {
        output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
      }
      return output
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl (input) {
      var i;
      var output = [];
      output[(input.length >> 2) - 1] = undefined;
      for (i = 0; i < output.length; i += 1) {
        output[i] = 0;
      }
      var length8 = input.length * 8;
      for (i = 0; i < length8; i += 8) {
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
      }
      return output
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstrMD5 (s) {
      return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstrHMACMD5 (key, data) {
      var i;
      var bkey = rstr2binl(key);
      var ipad = [];
      var opad = [];
      var hash;
      ipad[15] = opad[15] = undefined;
      if (bkey.length > 16) {
        bkey = binlMD5(bkey, key.length * 8);
      }
      for (i = 0; i < 16; i += 1) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5c5c5c5c;
      }
      hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
      return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex (input) {
      var hexTab = '0123456789abcdef';
      var output = '';
      var x;
      var i;
      for (i = 0; i < input.length; i += 1) {
        x = input.charCodeAt(i);
        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
      }
      return output
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstrUTF8 (input) {
      return unescape(encodeURIComponent(input))
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function rawMD5 (s) {
      return rstrMD5(str2rstrUTF8(s))
    }
    function hexMD5 (s) {
      return rstr2hex(rawMD5(s))
    }
    function rawHMACMD5 (k, d) {
      return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
    }
    function hexHMACMD5 (k, d) {
      return rstr2hex(rawHMACMD5(k, d))
    }

    function md5 (string, key, raw) {
      if (!key) {
        if (!raw) {
          return hexMD5(string)
        }
        return rawMD5(string)
      }
      if (!raw) {
        return hexHMACMD5(key, string)
      }
      return rawHMACMD5(key, string)
    }

    if (module.exports) {
      module.exports = md5;
    } else {
      $.md5 = md5;
    }
  })(commonjsGlobal);
  });

  var strictUriEncode = function (str) {
  	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
  		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  	});
  };

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
  	if (val === null || val === undefined) {
  		throw new TypeError('Object.assign cannot be called with null or undefined');
  	}

  	return Object(val);
  }

  function shouldUseNative() {
  	try {
  		if (!Object.assign) {
  			return false;
  		}

  		// Detect buggy property enumeration order in older V8 versions.

  		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
  		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
  		test1[5] = 'de';
  		if (Object.getOwnPropertyNames(test1)[0] === '5') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test2 = {};
  		for (var i = 0; i < 10; i++) {
  			test2['_' + String.fromCharCode(i)] = i;
  		}
  		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
  			return test2[n];
  		});
  		if (order2.join('') !== '0123456789') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test3 = {};
  		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
  			test3[letter] = letter;
  		});
  		if (Object.keys(Object.assign({}, test3)).join('') !==
  				'abcdefghijklmnopqrst') {
  			return false;
  		}

  		return true;
  	} catch (err) {
  		// We don't expect any of the above to throw, but better to be safe.
  		return false;
  	}
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  	var from;
  	var to = toObject(target);
  	var symbols;

  	for (var s = 1; s < arguments.length; s++) {
  		from = Object(arguments[s]);

  		for (var key in from) {
  			if (hasOwnProperty.call(from, key)) {
  				to[key] = from[key];
  			}
  		}

  		if (getOwnPropertySymbols) {
  			symbols = getOwnPropertySymbols(from);
  			for (var i = 0; i < symbols.length; i++) {
  				if (propIsEnumerable.call(from, symbols[i])) {
  					to[symbols[i]] = from[symbols[i]];
  				}
  			}
  		}
  	}

  	return to;
  };

  var token = '%[a-f0-9]{2}';
  var singleMatcher = new RegExp(token, 'gi');
  var multiMatcher = new RegExp('(' + token + ')+', 'gi');

  function decodeComponents(components, split) {
  	try {
  		// Try to decode the entire string first
  		return decodeURIComponent(components.join(''));
  	} catch (err) {
  		// Do nothing
  	}

  	if (components.length === 1) {
  		return components;
  	}

  	split = split || 1;

  	// Split the array in 2 parts
  	var left = components.slice(0, split);
  	var right = components.slice(split);

  	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
  }

  function decode(input) {
  	try {
  		return decodeURIComponent(input);
  	} catch (err) {
  		var tokens = input.match(singleMatcher);

  		for (var i = 1; i < tokens.length; i++) {
  			input = decodeComponents(tokens, i).join('');

  			tokens = input.match(singleMatcher);
  		}

  		return input;
  	}
  }

  function customDecodeURIComponent(input) {
  	// Keep track of all the replacements and prefill the map with the `BOM`
  	var replaceMap = {
  		'%FE%FF': '\uFFFD\uFFFD',
  		'%FF%FE': '\uFFFD\uFFFD'
  	};

  	var match = multiMatcher.exec(input);
  	while (match) {
  		try {
  			// Decode as big chunks as possible
  			replaceMap[match[0]] = decodeURIComponent(match[0]);
  		} catch (err) {
  			var result = decode(match[0]);

  			if (result !== match[0]) {
  				replaceMap[match[0]] = result;
  			}
  		}

  		match = multiMatcher.exec(input);
  	}

  	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
  	replaceMap['%C2'] = '\uFFFD';

  	var entries = Object.keys(replaceMap);

  	for (var i = 0; i < entries.length; i++) {
  		// Replace all decoded components
  		var key = entries[i];
  		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
  	}

  	return input;
  }

  var decodeUriComponent = function (encodedURI) {
  	if (typeof encodedURI !== 'string') {
  		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
  	}

  	try {
  		encodedURI = encodedURI.replace(/\+/g, ' ');

  		// Try the built in decoder first
  		return decodeURIComponent(encodedURI);
  	} catch (err) {
  		// Fallback to a more advanced decoder
  		return customDecodeURIComponent(encodedURI);
  	}
  };

  function encoderForArrayFormat(opts) {
  	switch (opts.arrayFormat) {
  		case 'index':
  			return function (key, value, index) {
  				return value === null ? [
  					encode(key, opts),
  					'[',
  					index,
  					']'
  				].join('') : [
  					encode(key, opts),
  					'[',
  					encode(index, opts),
  					']=',
  					encode(value, opts)
  				].join('');
  			};

  		case 'bracket':
  			return function (key, value) {
  				return value === null ? encode(key, opts) : [
  					encode(key, opts),
  					'[]=',
  					encode(value, opts)
  				].join('');
  			};

  		default:
  			return function (key, value) {
  				return value === null ? encode(key, opts) : [
  					encode(key, opts),
  					'=',
  					encode(value, opts)
  				].join('');
  			};
  	}
  }

  function parserForArrayFormat(opts) {
  	var result;

  	switch (opts.arrayFormat) {
  		case 'index':
  			return function (key, value, accumulator) {
  				result = /\[(\d*)\]$/.exec(key);

  				key = key.replace(/\[\d*\]$/, '');

  				if (!result) {
  					accumulator[key] = value;
  					return;
  				}

  				if (accumulator[key] === undefined) {
  					accumulator[key] = {};
  				}

  				accumulator[key][result[1]] = value;
  			};

  		case 'bracket':
  			return function (key, value, accumulator) {
  				result = /(\[\])$/.exec(key);
  				key = key.replace(/\[\]$/, '');

  				if (!result) {
  					accumulator[key] = value;
  					return;
  				} else if (accumulator[key] === undefined) {
  					accumulator[key] = [value];
  					return;
  				}

  				accumulator[key] = [].concat(accumulator[key], value);
  			};

  		default:
  			return function (key, value, accumulator) {
  				if (accumulator[key] === undefined) {
  					accumulator[key] = value;
  					return;
  				}

  				accumulator[key] = [].concat(accumulator[key], value);
  			};
  	}
  }

  function encode(value, opts) {
  	if (opts.encode) {
  		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
  	}

  	return value;
  }

  function keysSorter(input) {
  	if (Array.isArray(input)) {
  		return input.sort();
  	} else if (typeof input === 'object') {
  		return keysSorter(Object.keys(input)).sort(function (a, b) {
  			return Number(a) - Number(b);
  		}).map(function (key) {
  			return input[key];
  		});
  	}

  	return input;
  }

  function extract(str) {
  	var queryStart = str.indexOf('?');
  	if (queryStart === -1) {
  		return '';
  	}
  	return str.slice(queryStart + 1);
  }

  function parse(str, opts) {
  	opts = objectAssign({arrayFormat: 'none'}, opts);

  	var formatter = parserForArrayFormat(opts);

  	// Create an object with no prototype
  	// https://github.com/sindresorhus/query-string/issues/47
  	var ret = Object.create(null);

  	if (typeof str !== 'string') {
  		return ret;
  	}

  	str = str.trim().replace(/^[?#&]/, '');

  	if (!str) {
  		return ret;
  	}

  	str.split('&').forEach(function (param) {
  		var parts = param.replace(/\+/g, ' ').split('=');
  		// Firefox (pre 40) decodes `%3D` to `=`
  		// https://github.com/sindresorhus/query-string/pull/37
  		var key = parts.shift();
  		var val = parts.length > 0 ? parts.join('=') : undefined;

  		// missing `=` should be `null`:
  		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
  		val = val === undefined ? null : decodeUriComponent(val);

  		formatter(decodeUriComponent(key), val, ret);
  	});

  	return Object.keys(ret).sort().reduce(function (result, key) {
  		var val = ret[key];
  		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
  			// Sort object keys, not values
  			result[key] = keysSorter(val);
  		} else {
  			result[key] = val;
  		}

  		return result;
  	}, Object.create(null));
  }

  var extract_1 = extract;
  var parse_1 = parse;

  var stringify = function (obj, opts) {
  	var defaults = {
  		encode: true,
  		strict: true,
  		arrayFormat: 'none'
  	};

  	opts = objectAssign(defaults, opts);

  	if (opts.sort === false) {
  		opts.sort = function () {};
  	}

  	var formatter = encoderForArrayFormat(opts);

  	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
  		var val = obj[key];

  		if (val === undefined) {
  			return '';
  		}

  		if (val === null) {
  			return encode(key, opts);
  		}

  		if (Array.isArray(val)) {
  			var result = [];

  			val.slice().forEach(function (val2) {
  				if (val2 === undefined) {
  					return;
  				}

  				result.push(formatter(key, val2, result.length));
  			});

  			return result.join('&');
  		}

  		return encode(key, opts) + '=' + encode(val, opts);
  	}).filter(function (x) {
  		return x.length > 0;
  	}).join('&') : '';
  };

  var parseUrl = function (str, opts) {
  	return {
  		url: str.split('?')[0] || '',
  		query: parse(extract(str), opts)
  	};
  };

  var queryString = {
  	extract: extract_1,
  	parse: parse_1,
  	stringify: stringify,
  	parseUrl: parseUrl
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

  /**
   * Revenue API - instance constructor. Wrapper for logging Revenue data. Revenue objects get passed to amplitude.logRevenueV2 to send to Amplitude servers.
   * Each method updates a revenue property in the Revenue object, and returns the same Revenue object,
   * allowing you to chain multiple method calls together.
   *
   * Note: price is a required field to log revenue events.
   * If quantity is not specified then defaults to 1.
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
   *
   * Note: revenue amount is calculated as price * quantity.
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

  var uaParser = createCommonjsModule(function (module, exports) {
  /*!
   * UAParser.js v0.7.21
   * Lightweight JavaScript-based User-Agent string parser
   * https://github.com/faisalman/ua-parser-js
   *
   * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
   * Licensed under MIT License
   */

  (function (window, undefined$1) {

      //////////////
      // Constants
      /////////////


      var LIBVERSION  = '0.7.21',
          EMPTY       = '',
          UNKNOWN     = '?',
          FUNC_TYPE   = 'function',
          OBJ_TYPE    = 'object',
          STR_TYPE    = 'string',
          MAJOR       = 'major', // deprecated
          MODEL       = 'model',
          NAME        = 'name',
          TYPE        = 'type',
          VENDOR      = 'vendor',
          VERSION     = 'version',
          ARCHITECTURE= 'architecture',
          CONSOLE     = 'console',
          MOBILE      = 'mobile',
          TABLET      = 'tablet',
          SMARTTV     = 'smarttv',
          WEARABLE    = 'wearable',
          EMBEDDED    = 'embedded';


      ///////////
      // Helper
      //////////


      var util = {
          extend : function (regexes, extensions) {
              var mergedRegexes = {};
              for (var i in regexes) {
                  if (extensions[i] && extensions[i].length % 2 === 0) {
                      mergedRegexes[i] = extensions[i].concat(regexes[i]);
                  } else {
                      mergedRegexes[i] = regexes[i];
                  }
              }
              return mergedRegexes;
          },
          has : function (str1, str2) {
            if (typeof str1 === "string") {
              return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
            } else {
              return false;
            }
          },
          lowerize : function (str) {
              return str.toLowerCase();
          },
          major : function (version) {
              return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined$1;
          },
          trim : function (str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
          }
      };


      ///////////////
      // Map helper
      //////////////


      var mapper = {

          rgx : function (ua, arrays) {

              var i = 0, j, k, p, q, matches, match;

              // loop through all regexes maps
              while (i < arrays.length && !matches) {

                  var regex = arrays[i],       // even sequence (0,2,4,..)
                      props = arrays[i + 1];   // odd sequence (1,3,5,..)
                  j = k = 0;

                  // try matching uastring with regexes
                  while (j < regex.length && !matches) {

                      matches = regex[j++].exec(ua);

                      if (!!matches) {
                          for (p = 0; p < props.length; p++) {
                              match = matches[++k];
                              q = props[p];
                              // check if given property is actually array
                              if (typeof q === OBJ_TYPE && q.length > 0) {
                                  if (q.length == 2) {
                                      if (typeof q[1] == FUNC_TYPE) {
                                          // assign modified match
                                          this[q[0]] = q[1].call(this, match);
                                      } else {
                                          // assign given value, ignore regex match
                                          this[q[0]] = q[1];
                                      }
                                  } else if (q.length == 3) {
                                      // check whether function or regex
                                      if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                          // call function (usually string mapper)
                                          this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined$1;
                                      } else {
                                          // sanitize match using given regex
                                          this[q[0]] = match ? match.replace(q[1], q[2]) : undefined$1;
                                      }
                                  } else if (q.length == 4) {
                                          this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined$1;
                                  }
                              } else {
                                  this[q] = match ? match : undefined$1;
                              }
                          }
                      }
                  }
                  i += 2;
              }
          },

          str : function (str, map) {

              for (var i in map) {
                  // check if array
                  if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                      for (var j = 0; j < map[i].length; j++) {
                          if (util.has(map[i][j], str)) {
                              return (i === UNKNOWN) ? undefined$1 : i;
                          }
                      }
                  } else if (util.has(map[i], str)) {
                      return (i === UNKNOWN) ? undefined$1 : i;
                  }
              }
              return str;
          }
      };


      ///////////////
      // String map
      //////////////


      var maps = {

          browser : {
              oldsafari : {
                  version : {
                      '1.0'   : '/8',
                      '1.2'   : '/1',
                      '1.3'   : '/3',
                      '2.0'   : '/412',
                      '2.0.2' : '/416',
                      '2.0.3' : '/417',
                      '2.0.4' : '/419',
                      '?'     : '/'
                  }
              }
          },

          device : {
              amazon : {
                  model : {
                      'Fire Phone' : ['SD', 'KF']
                  }
              },
              sprint : {
                  model : {
                      'Evo Shift 4G' : '7373KT'
                  },
                  vendor : {
                      'HTC'       : 'APA',
                      'Sprint'    : 'Sprint'
                  }
              }
          },

          os : {
              windows : {
                  version : {
                      'ME'        : '4.90',
                      'NT 3.11'   : 'NT3.51',
                      'NT 4.0'    : 'NT4.0',
                      '2000'      : 'NT 5.0',
                      'XP'        : ['NT 5.1', 'NT 5.2'],
                      'Vista'     : 'NT 6.0',
                      '7'         : 'NT 6.1',
                      '8'         : 'NT 6.2',
                      '8.1'       : 'NT 6.3',
                      '10'        : ['NT 6.4', 'NT 10.0'],
                      'RT'        : 'ARM'
                  }
              }
          }
      };


      //////////////
      // Regex map
      /////////////


      var regexes = {

          browser : [[

              // Presto based
              /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
              /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
              /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
              /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
              ], [NAME, VERSION], [

              /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
              ], [[NAME, 'Opera Mini'], VERSION], [

              /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
              ], [[NAME, 'Opera'], VERSION], [

              // Mixed
              /(kindle)\/([\w\.]+)/i,                                             // Kindle
              /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
                                                                                  // Lunascape/Maxthon/Netfront/Jasmine/Blazer
              // Trident based
              /(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                  // Avant/IEMobile/SlimBrowser
              /(bidubrowser|baidubrowser)[\/\s]?([\w\.]+)/i,                      // Baidu Browser
              /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

              // Webkit/KHTML based
              /(rekonq)\/([\w\.]*)/i,                                             // Rekonq
              /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i
                                                                                  // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
              ], [NAME, VERSION], [

              /(konqueror)\/([\w\.]+)/i                                           // Konqueror
              ], [[NAME, 'Konqueror'], VERSION], [

              /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
              ], [[NAME, 'IE'], VERSION], [

              /(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i                          // Microsoft Edge
              ], [[NAME, 'Edge'], VERSION], [

              /(yabrowser)\/([\w\.]+)/i                                           // Yandex
              ], [[NAME, 'Yandex'], VERSION], [

              /(Avast)\/([\w\.]+)/i                                               // Avast Secure Browser
              ], [[NAME, 'Avast Secure Browser'], VERSION], [

              /(AVG)\/([\w\.]+)/i                                                 // AVG Secure Browser
              ], [[NAME, 'AVG Secure Browser'], VERSION], [

              /(puffin)\/([\w\.]+)/i                                              // Puffin
              ], [[NAME, 'Puffin'], VERSION], [

              /(focus)\/([\w\.]+)/i                                               // Firefox Focus
              ], [[NAME, 'Firefox Focus'], VERSION], [

              /(opt)\/([\w\.]+)/i                                                 // Opera Touch
              ], [[NAME, 'Opera Touch'], VERSION], [

              /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i         // UCBrowser
              ], [[NAME, 'UCBrowser'], VERSION], [

              /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
              ], [[NAME, /_/g, ' '], VERSION], [

              /(windowswechat qbcore)\/([\w\.]+)/i                                // WeChat Desktop for Windows Built-in Browser
              ], [[NAME, 'WeChat(Win) Desktop'], VERSION], [

              /(micromessenger)\/([\w\.]+)/i                                      // WeChat
              ], [[NAME, 'WeChat'], VERSION], [

              /(brave)\/([\w\.]+)/i                                               // Brave browser
              ], [[NAME, 'Brave'], VERSION], [

              /(qqbrowserlite)\/([\w\.]+)/i                                       // QQBrowserLite
              ], [NAME, VERSION], [

              /(QQ)\/([\d\.]+)/i                                                  // QQ, aka ShouQ
              ], [NAME, VERSION], [

              /m?(qqbrowser)[\/\s]?([\w\.]+)/i                                    // QQBrowser
              ], [NAME, VERSION], [

              /(baiduboxapp)[\/\s]?([\w\.]+)/i                                    // Baidu App
              ], [NAME, VERSION], [

              /(2345Explorer)[\/\s]?([\w\.]+)/i                                   // 2345 Browser
              ], [NAME, VERSION], [

              /(MetaSr)[\/\s]?([\w\.]+)/i                                         // SouGouBrowser
              ], [NAME], [

              /(LBBROWSER)/i                                                      // LieBao Browser
              ], [NAME], [

              /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
              ], [VERSION, [NAME, 'MIUI Browser']], [

              /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS & Android
              ], [VERSION, [NAME, 'Facebook']], [

              /safari\s(line)\/([\w\.]+)/i,                                       // Line App for iOS
              /android.+(line)\/([\w\.]+)\/iab/i                                  // Line App for Android
              ], [NAME, VERSION], [

              /headlesschrome(?:\/([\w\.]+)|\s)/i                                 // Chrome Headless
              ], [VERSION, [NAME, 'Chrome Headless']], [

              /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
              ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

              /((?:oculus|samsung)browser)\/([\w\.]+)/i
              ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [                // Oculus / Samsung Browser

              /((?:android.+)crmo|crios)\/([\w\.]+)/i,                            // Chrome for Android/iOS
              /android.+(chrome)\/([\w\.]+)\s+(?:mobile\s?safari)/i
              ], [[NAME, 'Chrome Mobile'], VERSION], [

              /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
              ], [VERSION, [NAME, 'Android Browser']], [

              /(sailfishbrowser)\/([\w\.]+)/i                                     // Sailfish Browser
              ], [[NAME, 'Sailfish Browser'], VERSION], [

              /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
                                                                                  // Chrome/OmniWeb/Arora/Tizen/Nokia
              ], [NAME, VERSION], [

              /(dolfin)\/([\w\.]+)/i                                              // Dolphin
              ], [[NAME, 'Dolphin'], VERSION], [

              /(qihu|qhbrowser|qihoobrowser|360browser)/i                         // 360
              ], [[NAME, '360 Browser']], [

              /(coast)\/([\w\.]+)/i                                               // Opera Coast
              ], [[NAME, 'Opera Coast'], VERSION], [

              /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
              ], [VERSION, [NAME, 'Firefox']], [

              /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
              ], [VERSION, [NAME, 'Mobile Safari']], [

              /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
              ], [VERSION, NAME], [

              /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Google Search Appliance on iOS
              ], [[NAME, 'GSA'], VERSION], [

              /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
              ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

              /(webkit|khtml)\/([\w\.]+)/i
              ], [NAME, VERSION], [

              // Gecko based
              /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
              ], [[NAME, 'Netscape'], VERSION], [
              /(swiftfox)/i,                                                      // Swiftfox
              /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                  // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
              /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)/i,

                                                                                  // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
              /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

              // Other
              /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                  // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
              /(links)\s\(([\w\.]+)/i,                                            // Links
              /(gobrowser)\/?([\w\.]*)/i,                                         // GoBrowser
              /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
              /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
              ], [NAME, VERSION]
          ],

          cpu : [[

              /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
              ], [[ARCHITECTURE, 'amd64']], [

              /(ia32(?=;))/i                                                      // IA32 (quicktime)
              ], [[ARCHITECTURE, util.lowerize]], [

              /((?:i[346]|x)86)[;\)]/i                                            // IA32
              ], [[ARCHITECTURE, 'ia32']], [

              // PocketPC mistakenly identified as PowerPC
              /windows\s(ce|mobile);\sppc;/i
              ], [[ARCHITECTURE, 'arm']], [

              /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
              ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

              /(sun4\w)[;\)]/i                                                    // SPARC
              ], [[ARCHITECTURE, 'sparc']], [

              /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                  // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
              ], [[ARCHITECTURE, util.lowerize]]
          ],

          device : [[

              /\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i                        // iPad/PlayBook
              ], [MODEL, VENDOR, [TYPE, TABLET]], [

              /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
              ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

              /(apple\s{0,1}tv)/i                                                 // Apple TV
              ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple'], [TYPE, SMARTTV]], [

              /(archos)\s(gamepad2?)/i,                                           // Archos
              /(hp).+(touchpad)/i,                                                // HP TouchPad
              /(hp).+(tablet)/i,                                                  // HP Tablet
              /(kindle)\/([\w\.]+)/i,                                             // Kindle
              /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
              /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
              ], [VENDOR, MODEL, [TYPE, TABLET]], [

              /(kf[A-z]+)\sbuild\/.+silk\//i                                      // Kindle Fire HD
              ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
              /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i                         // Fire Phone
              ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
              /android.+aft([bms])\sbuild/i                                       // Fire TV
              ], [MODEL, [VENDOR, 'Amazon'], [TYPE, SMARTTV]], [

              /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
              ], [MODEL, VENDOR, [TYPE, MOBILE]], [
              /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
              ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

              /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
              /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
                                                                                  // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
              /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
              /(asus)-?(\w+)/i                                                    // Asus
              ], [VENDOR, MODEL, [TYPE, MOBILE]], [
              /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
              ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                  // Asus Tablets
              /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i
              ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

              /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
              /(sony)?(?:sgp.+)\sbuild\//i
              ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
              /android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i
              ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [

              /\s(ouya)\s/i,                                                      // Ouya
              /(nintendo)\s([wids3u]+)/i                                          // Nintendo
              ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

              /android.+;\s(shield)\sbuild/i                                      // Nvidia
              ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

              /(playstation\s[34portablevi]+)/i                                   // Playstation
              ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

              /(sprint\s(\w+))/i                                                  // Sprint Phones
              ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

              /(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i,                        // HTC
              /(zte)-(\w*)/i,                                                     // ZTE
              /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
                                                                                  // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
              ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

              /(nexus\s9)/i                                                       // HTC Nexus 9
              ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

              /d\/huawei([\w\s-]+)[;\)]/i,
              /(nexus\s6p|vog-l29|ane-lx1|eml-l29)/i                              // Huawei
              ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

              /android.+(bah2?-a?[lw]\d{2})/i                                     // Huawei MediaPad
              ], [MODEL, [VENDOR, 'Huawei'], [TYPE, TABLET]], [

              /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
              ], [VENDOR, MODEL, [TYPE, MOBILE]], [

              /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
              ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
              /(kin\.[onetw]{3})/i                                                // Microsoft Kin
              ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                  // Motorola
              /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
              /mot[\s-]?(\w*)/i,
              /(XT\d{3,4}) build\//i,
              /(nexus\s6)/i
              ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
              /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
              ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

              /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
              ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [

              /hbbtv.+maple;(\d+)/i
              ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

              /\(dtv[\);].+(aquos)/i                                              // Sharp
              ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

              /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
              /((SM-T\w+))/i
              ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
              /smart-tv.+(samsung)/i
              ], [VENDOR, [TYPE, SMARTTV], MODEL], [
              /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
              /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
              /sec-((sgh\w+))/i
              ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

              /sie-(\w*)/i                                                        // Siemens
              ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

              /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
              /(nokia)[\s_-]?([\w-]*)/i
              ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

              /android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i                   // Acer
              ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

              /android.+([vl]k\-?\d{3})\s+build/i                                 // LG Tablet
              ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
              /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
              ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
              /(lg) netcast\.tv/i                                                 // LG SmartTV
              ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
              /(nexus\s[45])/i,                                                   // LG
              /lg[e;\s\/-]+(\w*)/i,
              /android.+lg(\-?[\d\w]+)\s+build/i
              ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

              /(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i             // Lenovo tablets
              ], [VENDOR, MODEL, [TYPE, TABLET]], [
              /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
              ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
              /(lenovo)[_\s-]?([\w-]+)/i
              ], [VENDOR, MODEL, [TYPE, MOBILE]], [

              /linux;.+((jolla));/i                                               // Jolla
              ], [VENDOR, MODEL, [TYPE, MOBILE]], [

              /((pebble))app\/[\d\.]+\s/i                                         // Pebble
              ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

              /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i                            // OPPO
              ], [VENDOR, MODEL, [TYPE, MOBILE]], [

              /crkey/i                                                            // Google Chromecast
              ], [[MODEL, 'Chromecast'], [VENDOR, 'Google'], [TYPE, SMARTTV]], [

              /android.+;\s(glass)\s\d/i                                          // Google Glass
              ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

              /android.+;\s(pixel c)[\s)]/i                                       // Google Pixel C
              ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [

              /android.+;\s(pixel( [23])?( xl)?)[\s)]/i                              // Google Pixel
              ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [

              /android.+;\s(\w+)\s+build\/hm\1/i,                                 // Xiaomi Hongmi 'numeric' models
              /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
              /android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    
                                                                                  // Xiaomi Mi
              /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i       // Redmi Phones
              ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
              /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i            // Mi Pad tablets
              ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
              /android.+;\s(m[1-5]\snote)\sbuild/i                                // Meizu
              ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
              /(mz)-([\w-]{2,})/i
              ], [[VENDOR, 'Meizu'], MODEL, [TYPE, MOBILE]], [

              /android.+a000(1)\s+build/i,                                        // OnePlus
              /android.+oneplus\s(a\d{4})[\s)]/i
              ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

              /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i                            // RCA Tablets
              ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [

              /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i                      // Dell Venue Tablets
              ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [

              /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i                         // Verizon Tablet
              ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [

              /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i     // Barnes & Noble Tablet
              ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [

              /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i                           // Barnes & Noble Tablet
              ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [

              /android.+;\s(k88)\sbuild/i                                         // ZTE K Series Tablet
              ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [

              /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i                         // Swiss GEN Mobile
              ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [

              /android.+[;\/]\s*(zur\d{3})\s+build/i                              // Swiss ZUR Tablet
              ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [

              /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i                         // Zeki Tablets
              ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [

              /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
              /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i        // Dragon Touch Tablet
              ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [

              /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i                            // Insignia Tablets
              ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [

              /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i                    // NextBook Tablets
              ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [

              /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
              ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [                    // Voice Xtreme Phones

              /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i                     // LvTel Phones
              ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [

              /android.+;\s(PH-1)\s/i
              ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [                // Essential PH-1

              /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i          // Envizen Tablets
              ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [

              /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i          // Le Pan Tablets
              ], [VENDOR, MODEL, [TYPE, TABLET]], [

              /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i                         // MachSpeed Tablets
              ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [

              /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i                // Trinity Tablets
              ], [VENDOR, MODEL, [TYPE, TABLET]], [

              /android.+[;\/]\s*TU_(1491)\s+build/i                               // Rotor Tablets
              ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [

              /android.+(KS(.+))\s+build/i                                        // Amazon Kindle Tablets
              ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [

              /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i                      // Gigaset Tablets
              ], [VENDOR, MODEL, [TYPE, TABLET]], [

              /\s(tablet|tab)[;\/]/i,                                             // Unidentifiable Tablet
              /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
              ], [[TYPE, util.lowerize], VENDOR, MODEL], [

              /[\s\/\(](smart-?tv)[;\)]/i                                         // SmartTV
              ], [[TYPE, SMARTTV]], [

              /(android[\w\.\s\-]{0,9});.+build/i                                 // Generic Android Device
              ], [MODEL, [VENDOR, 'Generic']]
          ],

          engine : [[

              /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
              ], [VERSION, [NAME, 'EdgeHTML']], [

              /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
              ], [VERSION, [NAME, 'Blink']], [

              /(presto)\/([\w\.]+)/i,                                             // Presto
              /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,     
                                                                                  // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
              /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
              /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
              ], [NAME, VERSION], [

              /rv\:([\w\.]{1,9}).+(gecko)/i                                       // Gecko
              ], [VERSION, NAME]
          ],

          os : [[

              // Windows based
              /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
              ], [NAME, VERSION], [
              /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
              /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,                   // Windows Phone
              /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
              ], [[NAME, mapper.str, maps.os.windows.name], [VERSION, mapper.str, maps.os.windows.version]], [
              /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
              ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

              // Mobile/Embedded OS
              /\((bb)(10);/i                                                      // BlackBerry 10
              ], [[NAME, 'BlackBerry'], VERSION], [
              /(blackberry)\w*\/?([\w\.]*)/i,                                     // Blackberry
              /(tizen|kaios)[\/\s]([\w\.]+)/i,                                    // Tizen/KaiOS
              /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i
                                                                                  // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki/Sailfish OS
              ], [NAME, VERSION], [
              /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i                  // Symbian
              ], [[NAME, 'Symbian'], VERSION], [
              /\((series40);/i                                                    // Series 40
              ], [NAME], [
              /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
              ], [[NAME, 'Firefox OS'], VERSION], [

              // Console
              /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

              // GNU/Linux based
              /(mint)[\/\s\(]?(\w*)/i,                                            // Mint
              /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
              /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
                                                                                  // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                  // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
              /(hurd|linux)\s?([\w\.]*)/i,                                        // Hurd/Linux
              /(gnu)\s?([\w\.]*)/i                                                // GNU
              ], [[NAME, 'Linux'], VERSION], [

              /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
              ], [[NAME, 'Chromium OS'], VERSION],[

              // Solaris
              /(sunos)\s?([\w\.\d]*)/i                                            // Solaris
              ], [[NAME, 'Solaris'], VERSION], [

              // BSD based
              /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
              ], [[NAME, 'Linux'], VERSION],[

              /(iphone)(?:.*os\s*([\w]*)\slike\smac|;\sopera)/i                  // iOS
              ], [[NAME, 'iPhone'], [VERSION, /_/g, '.']], [

              /(ipad)(?:.*os\s*([\w]*)\slike\smac|;\sopera)/i                    // iOS
              ], [[NAME, 'iPad'], [VERSION, /_/g, '.']], [

              /(haiku)\s(\w+)/i                                                   // Haiku
              ], [NAME, VERSION],[

              /cfnetwork\/.+darwin/i,
              /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i             // iOS
              ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [

              /(mac\sos\sx)\s?([\w\s\.]*)/i,
              /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
              ], [[NAME, 'Mac'], [VERSION, /_/g, '.']], [

              // Other
              /((?:open)?solaris)[\/\s-]?([\w\.]*)/i,                             // Solaris
              /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,                                // AIX
              /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,
                                                                                  // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS/Fuchsia
              /(unix)\s?([\w\.]*)/i                                               // UNIX
              ], [NAME, VERSION]
          ]
      };


      /////////////////
      // Constructor
      ////////////////
      var UAParser = function (uastring, extensions) {

          if (typeof uastring === 'object') {
              extensions = uastring;
              uastring = undefined$1;
          }

          if (!(this instanceof UAParser)) {
              return new UAParser(uastring, extensions).getResult();
          }

          var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
          var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

          this.getBrowser = function () {
              var browser = { name: undefined$1, version: undefined$1 };
              mapper.rgx.call(browser, ua, rgxmap.browser);
              browser.major = util.major(browser.version); // deprecated
              return browser;
          };
          this.getCPU = function () {
              var cpu = { architecture: undefined$1 };
              mapper.rgx.call(cpu, ua, rgxmap.cpu);
              return cpu;
          };
          this.getDevice = function () {
              var device = { vendor: undefined$1, model: undefined$1, type: undefined$1 };
              mapper.rgx.call(device, ua, rgxmap.device);
              return device;
          };
          this.getEngine = function () {
              var engine = { name: undefined$1, version: undefined$1 };
              mapper.rgx.call(engine, ua, rgxmap.engine);
              return engine;
          };
          this.getOS = function () {
              var os = { name: undefined$1, version: undefined$1 };
              mapper.rgx.call(os, ua, rgxmap.os);
              return os;
          };
          this.getResult = function () {
              return {
                  ua      : this.getUA(),
                  browser : this.getBrowser(),
                  engine  : this.getEngine(),
                  os      : this.getOS(),
                  device  : this.getDevice(),
                  cpu     : this.getCPU()
              };
          };
          this.getUA = function () {
              return ua;
          };
          this.setUA = function (uastring) {
              ua = uastring;
              return this;
          };
          return this;
      };

      UAParser.VERSION = LIBVERSION;
      UAParser.BROWSER = {
          NAME    : NAME,
          MAJOR   : MAJOR, // deprecated
          VERSION : VERSION
      };
      UAParser.CPU = {
          ARCHITECTURE : ARCHITECTURE
      };
      UAParser.DEVICE = {
          MODEL   : MODEL,
          VENDOR  : VENDOR,
          TYPE    : TYPE,
          CONSOLE : CONSOLE,
          MOBILE  : MOBILE,
          SMARTTV : SMARTTV,
          TABLET  : TABLET,
          WEARABLE: WEARABLE,
          EMBEDDED: EMBEDDED
      };
      UAParser.ENGINE = {
          NAME    : NAME,
          VERSION : VERSION
      };
      UAParser.OS = {
          NAME    : NAME,
          VERSION : VERSION
      };

      ///////////
      // Export
      //////////


      // check js environment
      {
          // nodejs env
          if (module.exports) {
              exports = module.exports = UAParser;
          }
          exports.UAParser = UAParser;
      }

      // jQuery/Zepto specific (optional)
      // Note:
      //   In AMD env the global scope should be kept clean, but jQuery is an exception.
      //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
      //   and we should catch that.
      var $ = window && (window.jQuery || window.Zepto);
      if ($ && !$.ua) {
          var parser = new UAParser();
          $.ua = parser.getResult();
          $.ua.get = function () {
              return parser.getUA();
          };
          $.ua.set = function (uastring) {
              parser.setUA(uastring);
              var result = parser.getResult();
              for (var prop in result) {
                  $.ua[prop] = result[prop];
              }
          };
      }

  })(typeof window === 'object' ? window : commonjsGlobal);
  });
  var uaParser_1 = uaParser.UAParser;

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
    ? // a random number from 0 to 15
    (a ^ // unless b is 8,
    Math.random() * // in which case
    16 >> // a random number from
    a / 4). // 8 to 11
    toString(16) // in hexadecimal
    : // or otherwise a concatenated string:
    ([1e7] + // 10000000 +
    -1e3 + // -1000 +
    -4e3 + // -4000 +
    -8e3 + // -80000000 +
    -1e11). // -100000000000,
    replace( // replacing
    /[018]/g, // zeroes, ones, and eights with
    uuid // random hex digits
    );
  };

  var version = "7.4.2";

  var getLanguage = function getLanguage() {
    return navigator && (navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage) || '';
  };

  var language = {
    getLanguage: getLanguage
  };

  var platform = 'Web';

  {
    var _require = require('react-native'),
        Platform = _require.Platform;

    if (Platform.OS === 'ios') {
      platform = 'iOS';
    } else if (Platform.OS === 'android') {
      platform = 'Android';
    }
  }
  /**
   * Options used when initializing Amplitude
   * @typedef {Object} Options
   * @property {string} [apiEndpoint=`api.amplitude.com`] - Endpoint to send amplitude event requests to.
   * @property {boolean} [batchEvents=`false`] -  If `true`, then events are batched together and uploaded only when the number of unsent events is greater than or equal to eventUploadThreshold or after eventUploadPeriodMillis milliseconds have passed since the first unsent event was logged.
   * @property {number} [cookieExpiration=`365`] - The number of days after which the Amplitude cookie will expire. 12 months is for GDPR compliance.
   * @property {string} [cookieName=`amplitude_id`] - *DEPRECATED*
   * @property {string} [sameSiteCookie='None'] -  Sets the SameSite flag on the amplitude cookie. Decides cookie privacy policy.
   * @property {boolean} [cookieForceUpgrade=`false`] - Forces pre-v6.0.0 instances to adopt post-v6.0.0 compat cookie formats.
   * @property {boolean} [deferInitialization=`null`] -  If `true`, disables the core functionality of the sdk, including saving a cookie and all logging, until explicitly enabled. To enable tracking, please call `amplitude.getInstance().enableTracking()` *Note: This will not affect users who already have an amplitude cookie. The decision to track events is determined by whether or not a user has an amplitude analytics cookie. If the `cookieExpiration</code> is manually defined to be a short lifespan, you may need to run `amplitude.getInstance().enableTracking()` upon the cookie expiring or upon logging in.*
   * @property {boolean} [disableCookies=`false`] -  Disable Ampllitude cookies altogether.
   * @property {string} [deviceId=A randomly generated UUID.] -  The custom Device ID to set. *Note: This is not recommended unless you know what you are doing (e.g. you have your own system for tracking user devices).*
   * @property {boolean} [deviceIdFromUrlParam=`false`] -  If `true`, then the SDK will parse Device ID values from the URL parameter amp_device_id if available. Device IDs defined in the configuration options during init will take priority over Device IDs from URL parameters.
   * @property {string} [domain=The top domain of the current page's URL. ('https://amplitude.com')] -  Set a custom domain for the Amplitude cookie. To include subdomains, add a preceding period, eg: `.amplitude.com`.
   * @property {number} [eventUploadPeriodMillis=`30000` (30 sec)] -  Amount of time in milliseconds that the SDK waits before uploading events if batchEvents is true.
   * @property {number} [eventUploadThreshold=`30`] -  Minimum number of events to batch together per request if batchEvents is true.
   * @property {boolean} [forceHttps=`true`] -  If `true`, the events will always be uploaded to HTTPS endpoint. Otherwise, it will use the embedding site's protocol.
   * @property {boolean} [includeFbclid=`false`] -  If `true`, captures the fbclid URL parameter as well as the user's initial_fbclid via a setOnce operation.
   * @property {boolean} [includeGclid=`false`] -  If `true`, captures the gclid URL parameter as well as the user's initial_gclid via a setOnce operation.
   * @property {boolean} [includeReferrer=`false`] -  If `true`, captures the referrer and referring_domain for each session, as well as the user's initial_referrer and initial_referring_domain via a setOnce operation.
   * @property {boolean} [includeUtm=`false`] -  If `true`, finds UTM parameters in the query string or the _utmz cookie, parses, and includes them as user properties on all events uploaded. This also captures initial UTM parameters for each session via a setOnce operation.
   * @property {string} [language=The language determined by the browser] -  Custom language to set.
   * @property {string} [logLevel=`WARN`] -  Level of logs to be printed in the developer console. Valid values are 'DISABLE', 'ERROR', 'WARN', 'INFO'. To learn more about the different options, see below.
   * @property {boolean} [logAttributionCapturedEvent=`false`] - If `true`, the SDK will log an Amplitude event anytime new attribution values are captured from the user. **Note: These events count towards your event volume.** Event name being logged: [Amplitude] Attribution Captured. Event Properties that can be logged: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `referring_domain`, `gclid`, `fbclid`. For UTM properties to be logged, `includeUtm` must be set to `true`. For the `referrer` and `referring_domain` properties to be logged, `includeReferrer` must be set to `true`. For the `gclid` property to be logged, `includeGclid` must be set to `true`. For the `fbclid` property to be logged, `includeFbclid` must be set to `true`.
   * @property {boolean} [optOut=`false`] -  Whether or not to disable tracking for the current user.
   * @property {function} [onError=`() => {}`] - Function to call on error.
   * @property {string} [platform=`Web`|`iOS`|`Android`] -  Platform device is running on. `Web` is a browser (including mobile browsers). `iOS` and `Android` are relevant only for react-native apps.
   * @property {number} [savedMaxCount=`1000`] -  Maximum number of events to save in localStorage. If more events are logged while offline, then old events are removed.
   * @property {boolean} [saveEvents=`true`] -  If `true`, saves events to localStorage and removes them upon successful upload. *Note: Without saving events, events may be lost if the user navigates to another page before the events are uploaded.*
   * @property {boolean} [saveParamsReferrerOncePerSession=`true`] -  If `true`, then includeGclid, includeFbclid, includeReferrer, and includeUtm will only track their respective properties once per session. New values that come in during the middle of the user's session will be ignored. Set to false to always capture new values.
   * @property {boolean} [secureCookie=`false`] -  If `true`, the amplitude cookie will be set with the Secure flag.
   * @property {number} [sessionTimeout=`30*60*1000` (30 min)] -  The time between logged events before a new session starts in milliseconds.
   * @property {Object} [trackingOptions=`{ city: true, country: true, carrier: true, device_manufacturer: true, device_model: true, dma: true, ip_address: true, language: true, os_name: true, os_version: true, platform: true, region: true, version_name: true}`] - Type of data associated with a user.
   * @property {boolean} [unsetParamsReferrerOnNewSession=`false`] -  If `false`, the existing `referrer` and `utm_parameter` values will be carried through each new session. If set to `true`, the `referrer` and `utm_parameter` user properties, which include `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content`, will be set to `null` upon instantiating a new session. Note: This only works if `includeReferrer` or `includeUtm` is set to `true`.
   * @property {string} [unsentKey=`amplitude_unsent`] - localStorage key that stores unsent events.
   * @property {string} [unsentIdentifyKey=`amplitude_unsent_identify`] - localStorage key that stores unsent identifies.
   * @property {number} [uploadBatchSize=`100`] -  The maximum number of events to send to the server per request.
   */


  var DEFAULT_OPTIONS = {
    apiEndpoint: 'api.amplitude.com',
    batchEvents: false,
    cookieExpiration: 365,
    // 12 months is for GDPR compliance
    cookieName: 'amplitude_id',
    // this is a deprecated option
    sameSiteCookie: 'Lax',
    // cookie privacy policy
    cookieForceUpgrade: false,
    deferInitialization: false,
    disableCookies: false,
    // this is a deprecated option
    deviceIdFromUrlParam: false,
    domain: '',
    eventUploadPeriodMillis: 30 * 1000,
    // 30s
    eventUploadThreshold: 30,
    forceHttps: true,
    includeFbclid: false,
    includeGclid: false,
    includeReferrer: false,
    includeUtm: false,
    language: language.getLanguage(),
    logLevel: 'WARN',
    logAttributionCapturedEvent: false,
    optOut: false,
    onError: function onError() {},
    platform: platform,
    savedMaxCount: 1000,
    saveEvents: true,
    saveParamsReferrerOncePerSession: true,
    secureCookie: false,
    sessionTimeout: 30 * 60 * 1000,
    storage: Constants.STORAGE_DEFAULT,
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
  var Platform$1;
  var DeviceInfo;

  {
    var reactNative = require('react-native');

    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    Platform$1 = reactNative.Platform;
    DeviceInfo = require('react-native-device-info');
  }
  /**
   * AmplitudeClient SDK API - instance constructor.
   * The Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()
   * @constructor AmplitudeClient
   * @public
   * @example var amplitudeClient = new AmplitudeClient();
   */


  var AmplitudeClient = function AmplitudeClient(instanceName) {
    if (!isBrowserEnv()) {
      utils.log.warn('amplitude-js will not work in a non-browser environment. If you are planning to add Amplitude to a node environment, please use @amplitude/node');
    }

    this._instanceName = utils.isEmptyString(instanceName) ? Constants.DEFAULT_INSTANCE : instanceName.toLowerCase();
    this._unsentEvents = [];
    this._unsentIdentifys = [];
    this._ua = new uaParser(navigator.userAgent).getResult();
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
    this._newSession = false; // sequence used for by frontend for prioritizing event send retries

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
   * See [options.js](https://amplitude.github.io/Amplitude-JavaScript/Options) for a list of options and default values.
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
      _parseConfig(this.options, opt_config);

      if (isBrowserEnv() && window.Prototype !== undefined && Array.prototype.toJSON) {
        prototypeJsFix();
        utils.log.warn('Prototype.js injected Array.prototype.toJSON. Deleting Array.prototype.toJSON to prevent double-stringify');
      }

      if (this.options.cookieName !== DEFAULT_OPTIONS.cookieName) {
        utils.log.warn('The cookieName option is deprecated. We will be ignoring it for newer cookies');
      }

      this.options.apiKey = apiKey;
      this._storageSuffix = '_' + apiKey + (this._instanceName === Constants.DEFAULT_INSTANCE ? '' : '_' + this._instanceName);
      this._storageSuffixV5 = apiKey.slice(0, 6);
      this._oldCookiename = this.options.cookieName + this._storageSuffix;
      this._unsentKey = this.options.unsentKey + this._storageSuffix;
      this._unsentIdentifyKey = this.options.unsentIdentifyKey + this._storageSuffix;
      this._cookieName = Constants.COOKIE_PREFIX + '_' + this._storageSuffixV5;
      this.cookieStorage.options({
        expirationDays: this.options.cookieExpiration,
        domain: this.options.domain,
        secure: this.options.secureCookie,
        sameSite: this.options.sameSiteCookie
      });
      this._metadataStorage = new MetadataStorage({
        storageKey: this._cookieName,
        disableCookies: this.options.disableCookies,
        expirationDays: this.options.cookieExpiration,
        domain: this.options.domain,
        secure: this.options.secureCookie,
        sameSite: this.options.sameSiteCookie,
        storage: this.options.storage
      });
      var hasOldCookie = !!this.cookieStorage.get(this._oldCookiename);
      var hasNewCookie = !!this._metadataStorage.load();
      this._useOldCookie = !hasNewCookie && hasOldCookie && !this.options.cookieForceUpgrade;
      var hasCookie = hasNewCookie || hasOldCookie;
      this.options.domain = this.cookieStorage.options().domain;

      if (this.options.deferInitialization && !hasCookie) {
        this._deferInitialization(apiKey, opt_userId, opt_config, opt_callback);

        return;
      }

      if (type(this.options.logLevel) === 'string') {
        utils.setLogLevel(this.options.logLevel);
      }

      var trackingOptions = _generateApiPropertiesTrackingConfig(this);

      this._apiPropertiesTrackingOptions = Object.keys(trackingOptions).length > 0 ? {
        tracking_options: trackingOptions
      } : {};

      if (this.options.cookieForceUpgrade && hasOldCookie) {
        if (!hasNewCookie) {
          _upgradeCookieData(this);
        }

        this.cookieStorage.remove(this._oldCookiename);
      }

      _loadCookieData(this);

      this._pendingReadStorage = true;

      var initFromStorage = function initFromStorage(storedDeviceId) {
        _this.options.deviceId = _this._getInitialDeviceId(opt_config && opt_config.deviceId, storedDeviceId);
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
          _validateUnsentEventQueue(_this._unsentEvents);

          _validateUnsentEventQueue(_this._unsentIdentifys);
        }

        _this._lastEventTime = now;

        _saveCookieData(_this);

        _this._pendingReadStorage = false;

        _this._sendEventsIfReady(); // try sending unsent events


        for (var i = 0; i < _this._onInit.length; i++) {
          _this._onInit[i](_this);
        }

        _this._onInit = [];
        _this._isInitialized = true;
      };

      if (AsyncStorage) {
        this._migrateUnsentEvents(function () {
          Promise.all([AsyncStorage.getItem(_this._storageSuffix), AsyncStorage.getItem(_this.options.unsentKey + _this._storageSuffix), AsyncStorage.getItem(_this.options.unsentIdentifyKey + _this._storageSuffix)]).then(function (values) {
            if (values[0]) {
              var cookieData = JSON.parse(values[0]);

              if (cookieData) {
                _loadCookieDataProps(_this, cookieData);
              }
            }

            if (_this.options.saveEvents) {
              _this._unsentEvents = _this._parseSavedUnsentEventsString(values[1]).map(function (event) {
                return {
                  event: event
                };
              }).concat(_this._unsentEvents);
              _this._unsentIdentifys = _this._parseSavedUnsentEventsString(values[2]).map(function (event) {
                return {
                  event: event
                };
              }).concat(_this._unsentIdentifys);
            }

            if (DeviceInfo) {
              Promise.all([DeviceInfo.getCarrier(), DeviceInfo.getModel(), DeviceInfo.getManufacturer(), DeviceInfo.getVersion(), DeviceInfo.getUniqueId()]).then(function (values) {
                _this.deviceInfo = {
                  carrier: values[0],
                  model: values[1],
                  manufacturer: values[2],
                  version: values[3]
                };
                initFromStorage(values[4]);

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
        });
      } else {
        if (this.options.saveEvents) {
          this._unsentEvents = this._loadSavedUnsentEvents(this.options.unsentKey).map(function (event) {
            return {
              event: event
            };
          }).concat(this._unsentEvents);
          this._unsentIdentifys = this._loadSavedUnsentEvents(this.options.unsentIdentifyKey).map(function (event) {
            return {
              event: event
            };
          }).concat(this._unsentIdentifys);
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

  AmplitudeClient.prototype.deleteLowerLevelDomainCookies = function () {
    var host = getHost();
    var cookieHost = this.options.domain && this.options.domain[0] === '.' ? this.options.domain.slice(1) : this.options.domain;

    if (!cookieHost) {
      return;
    }

    if (host !== cookieHost) {
      if (new RegExp(cookieHost + '$').test(host)) {
        var hostParts = host.split('.');
        var cookieHostParts = cookieHost.split('.');

        for (var i = hostParts.length; i > cookieHostParts.length; --i) {
          var deleteDomain = hostParts.slice(hostParts.length - i).join('.');
          baseCookie.set(this._cookieName, null, {
            domain: '.' + deleteDomain
          });
        }

        baseCookie.set(this._cookieName, null, {});
      }
    }
  };

  AmplitudeClient.prototype._getInitialDeviceId = function (configDeviceId, storedDeviceId) {
    if (configDeviceId) {
      return configDeviceId;
    }

    if (this.options.deviceIdFromUrlParam) {
      var deviceIdFromUrlParam = this._getDeviceIdFromUrlParam(this._getUrlParams());

      if (deviceIdFromUrlParam) {
        return deviceIdFromUrlParam;
      }
    }

    if (this.options.deviceId) {
      return this.options.deviceId;
    }

    if (storedDeviceId) {
      return storedDeviceId;
    }

    return base64Id();
  }; // validate properties for unsent events


  var _validateUnsentEventQueue = function _validateUnsentEventQueue(queue) {
    for (var i = 0; i < queue.length; i++) {
      var userProperties = queue[i].event.user_properties;
      var eventProperties = queue[i].event.event_properties;
      var groups = queue[i].event.groups;
      queue[i].event.user_properties = utils.validateProperties(userProperties);
      queue[i].event.event_properties = utils.validateProperties(eventProperties);
      queue[i].event.groups = utils.validateGroups(groups);
    }
  };
  /**
   * @private
   */


  AmplitudeClient.prototype._migrateUnsentEvents = function _migrateUnsentEvents(cb) {
    var _this2 = this;

    Promise.all([AsyncStorage.getItem(this.options.unsentKey), AsyncStorage.getItem(this.options.unsentIdentifyKey)]).then(function (values) {
      if (_this2.options.saveEvents) {
        var unsentEventsString = values[0];
        var unsentIdentifyKey = values[1];
        var itemsToSet = [];
        var itemsToRemove = [];

        if (unsentEventsString) {
          itemsToSet.push(AsyncStorage.setItem(_this2.options.unsentKey + _this2._storageSuffix, JSON.stringify(unsentEventsString)));
          itemsToRemove.push(AsyncStorage.removeItem(_this2.options.unsentKey));
        }

        if (unsentIdentifyKey) {
          itemsToSet.push(AsyncStorage.setItem(_this2.options.unsentIdentifyKey + _this2._storageSuffix, JSON.stringify(unsentIdentifyKey)));
          itemsToRemove.push(AsyncStorage.removeItem(_this2.options.unsentIdentifyKey));
        }

        if (itemsToSet.length > 0) {
          Promise.all(itemsToSet).then(function () {
          }).catch(function (err) {
            _this2.options.onError(err);
          });
        }
      }
    }).then(cb).catch(function (err) {
      _this2.options.onError(err);
    });
  };
  /**
   * @private
   */


  AmplitudeClient.prototype._trackParamsAndReferrer = function _trackParamsAndReferrer() {
    var utmProperties;
    var referrerProperties;
    var gclidProperties;
    var fbclidProperties;

    if (this.options.includeUtm) {
      utmProperties = this._initUtmData();
    }

    if (this.options.includeReferrer) {
      referrerProperties = this._saveReferrer(this._getReferrer());
    }

    if (this.options.includeGclid) {
      gclidProperties = this._saveGclid(this._getUrlParams());
    }

    if (this.options.includeFbclid) {
      fbclidProperties = this._saveFbclid(this._getUrlParams());
    }

    if (this.options.logAttributionCapturedEvent) {
      var attributionProperties = _objectSpread({}, utmProperties, referrerProperties, gclidProperties, fbclidProperties);

      if (Object.keys(attributionProperties).length > 0) {
        this.logEvent(Constants.ATTRIBUTION_EVENT, attributionProperties);
      }
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
      if (!Object.prototype.hasOwnProperty.call(options, key)) {
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
      if (Object.prototype.hasOwnProperty.call(config, key)) {
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
      /* eslint-disable-line no-empty */

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
   * Add callbacks to call after init. Useful for users who load Amplitude through a snippet.
   * @public
   */


  AmplitudeClient.prototype.onInit = function (callback) {
    if (this._isInitialized) {
      callback(this);
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


  AmplitudeClient.prototype._sendEventsIfReady = function _sendEventsIfReady() {
    if (this._unsentCount() === 0) {
      return false;
    } // if batching disabled, send any unsent events immediately


    if (!this.options.batchEvents) {
      this.sendEvents();
      return true;
    } // if batching enabled, check if min threshold met for batch size


    if (this._unsentCount() >= this.options.eventUploadThreshold) {
      this.sendEvents();
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
  /**
   * Fetches deviceId, userId, event meta data from amplitude cookie
   * @private
   */


  var _loadCookieData = function _loadCookieData(scope) {
    if (!scope._useOldCookie) {
      var props = scope._metadataStorage.load();

      if (type(props) === 'object') {
        _loadCookieDataProps(scope, props);
      }

      return;
    }

    var cookieData = scope.cookieStorage.get(scope._oldCookiename);

    if (type(cookieData) === 'object') {
      _loadCookieDataProps(scope, cookieData);

      return;
    }
  };

  var _upgradeCookieData = function _upgradeCookieData(scope) {
    var cookieData = scope.cookieStorage.get(scope._oldCookiename);

    if (type(cookieData) === 'object') {
      _loadCookieDataProps(scope, cookieData);

      _saveCookieData(scope);
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
      scope._sessionId = parseInt(cookieData.sessionId, 10);
    }

    if (cookieData.lastEventTime) {
      scope._lastEventTime = parseInt(cookieData.lastEventTime, 10);
    }

    if (cookieData.eventId) {
      scope._eventId = parseInt(cookieData.eventId, 10);
    }

    if (cookieData.identifyId) {
      scope._identifyId = parseInt(cookieData.identifyId, 10);
    }

    if (cookieData.sequenceNumber) {
      scope._sequenceNumber = parseInt(cookieData.sequenceNumber, 10);
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

    if (scope._useOldCookie) {
      scope.cookieStorage.set(scope.options.cookieName + scope._storageSuffix, cookieData);
    } else {
      scope._metadataStorage.save(cookieData);
    }
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

    return utmProperties;
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
      if (Object.prototype.hasOwnProperty.call(userProperties, key)) {
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
      gclid: gclid
    };

    _sendParamsReferrerUserProperties(this, gclidProperties);

    return gclidProperties;
  };
  /**
   * Try to fetch Facebook Fbclid from url params.
   * @private
   */


  AmplitudeClient.prototype._saveFbclid = function _saveFbclid(urlParams) {
    var fbclid = utils.getQueryParam('fbclid', urlParams);

    if (utils.isEmptyString(fbclid)) {
      return;
    }

    var fbclidProperties = {
      fbclid: fbclid
    };

    _sendParamsReferrerUserProperties(this, fbclidProperties);

    return fbclidProperties;
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
      referrer: referrer,
      referring_domain: this._getReferringDomain(referrer)
    };

    _sendParamsReferrerUserProperties(this, referrerInfo);

    return referrerInfo;
  };
  /**
   * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
   * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
   * @private
   */


  AmplitudeClient.prototype.saveEvents = function saveEvents() {
    try {
      var serializedUnsentEvents = JSON.stringify(this._unsentEvents.map(function (_ref) {
        var event = _ref.event;
        return event;
      }));

      if (AsyncStorage) {
        AsyncStorage.setItem(this.options.unsentKey + this._storageSuffix, serializedUnsentEvents);
      } else {
        this._setInStorage(localStorage$1, this.options.unsentKey, serializedUnsentEvents);
      }
    } catch (e) {}
    /* eslint-disable-line no-empty */


    try {
      var serializedIdentifys = JSON.stringify(this._unsentIdentifys.map(function (unsentIdentify) {
        return unsentIdentify.event;
      }));

      if (AsyncStorage) {
        AsyncStorage.setItem(this.options.unsentIdentifyKey + this._storageSuffix, serializedIdentifys);
      } else {
        this._setInStorage(localStorage$1, this.options.unsentIdentifyKey, serializedIdentifys);
      }
    } catch (e) {}
    /* eslint-disable-line no-empty */

  };
  /**
   * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
   * @public
   * @param {string} domain to set.
   * @example amplitudeClient.setDomain('.amplitude.com');
   */


  AmplitudeClient.prototype.setDomain = function setDomain(domain) {
    if (this._shouldDeferCall()) {
      return this._q.push(['setDomain'].concat(Array.prototype.slice.call(arguments, 0)));
    }

    if (!utils.validateInput(domain, 'domain', 'string')) {
      return;
    }

    try {
      this.cookieStorage.options({
        expirationDays: this.options.cookieExpiration,
        secure: this.options.secureCookie,
        domain: domain,
        sameSite: this.options.sameSiteCookie
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
    if (this._shouldDeferCall()) {
      return this._q.push(['setUserId'].concat(Array.prototype.slice.call(arguments, 0)));
    }

    try {
      this.options.userId = userId !== undefined && userId !== null && '' + userId || null;

      _saveCookieData(this);
    } catch (e) {
      utils.log.error(e);
    }
  };
  /**
   * Add user to a group or groups. You need to specify a groupType and groupName(s).
   *
   * For example you can group people by their organization.
   * In that case, groupType is "orgId" and groupName would be the actual ID(s).
   * groupName can be a string or an array of strings to indicate a user in multiple gruups.
   * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
   *
   * Note: this will also set groupType: groupName as a user property.
   * See the [advanced topics article](https://developers.amplitude.com/docs/setting-user-groups) for more information.
   * @public
   * @param {string} groupType - the group type (ex: orgId)
   * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
   * @example amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.
   */


  AmplitudeClient.prototype.setGroup = function (groupType, groupName) {
    if (this._shouldDeferCall()) {
      return this._q.push(['setGroup'].concat(Array.prototype.slice.call(arguments, 0)));
    }

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
    if (this._shouldDeferCall()) {
      return this._q.push(['setOptOut'].concat(Array.prototype.slice.call(arguments, 0)));
    }

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
    if (this._shouldDeferCall()) {
      return this._q.push(['regenerateDeviceId'].concat(Array.prototype.slice.call(arguments, 0)));
    }

    this.setDeviceId(base64Id());
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
    if (this._shouldDeferCall()) {
      return this._q.push(['setDeviceId'].concat(Array.prototype.slice.call(arguments, 0)));
    }

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
    if (this._shouldDeferCall()) {
      return this._q.push(['setUserProperties'].concat(Array.prototype.slice.call(arguments, 0)));
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
      if (Object.prototype.hasOwnProperty.call(sanitized, property)) {
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
    if (this._shouldDeferCall()) {
      return this._q.push(['clearUserProperties'].concat(Array.prototype.slice.call(arguments, 0)));
    }

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
   * See the [Identify](https://amplitude.github.io/Amplitude-JavaScript/Identify/)
   * reference page for more information on the Identify API and user property operations.
   * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
   * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
   * Note: the server response code and response body from the identify event upload are passed to the callback function.
   * @example
   * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
   * amplitude.identify(identify);
   */


  AmplitudeClient.prototype.identify = function (identify_obj, opt_callback) {
    if (this._shouldDeferCall()) {
      return this._q.push(['identify'].concat(Array.prototype.slice.call(arguments, 0)));
    }

    if (!this._apiKeySet('identify()')) {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', {
          reason: 'API key is not set'
        });
      }

      return;
    } // if identify input is a proxied object created by the async loading snippet, convert it into an identify object


    if (type(identify_obj) === 'object' && Object.prototype.hasOwnProperty.call(identify_obj, '_q')) {
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
    if (this._shouldDeferCall()) {
      return this._q.push(['groupIdentify'].concat(Array.prototype.slice.call(arguments, 0)));
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


    if (type(identify_obj) === 'object' && Object.prototype.hasOwnProperty.call(identify_obj, '_q')) {
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
    if (this._shouldDeferCall()) {
      return this._q.push(['setVersionName'].concat(Array.prototype.slice.call(arguments, 0)));
    }

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
      var versionName;
      var carrier;

      {
        osName = Platform$1.OS;
        osVersion = Platform$1.Version;

        if (this.deviceInfo) {
          carrier = this.deviceInfo.carrier;
          deviceManufacturer = this.deviceInfo.manufacturer;
          deviceModel = this.deviceInfo.model;
          versionName = this.deviceInfo.version;
        }
      }

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
        version_name: _shouldTrackField(this, 'version_name') ? this.options.versionName || versionName || null : null,
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
          name: 'amplitude-react-native',
          version: version
        },
        sequence_number: sequenceNumber,
        // for ordering events and identifys
        groups: utils.truncate(utils.validateGroups(groups)),
        group_properties: utils.truncate(utils.validateProperties(groupProperties)),
        user_agent: this._userAgent
      };

      if (eventType === Constants.IDENTIFY_EVENT || eventType === Constants.GROUP_IDENTIFY_EVENT) {
        this._unsentIdentifys.push({
          event: event,
          callback: callback
        });

        this._limitEventsQueued(this._unsentIdentifys);
      } else {
        this._unsentEvents.push({
          event: event,
          callback: callback
        });

        this._limitEventsQueued(this._unsentEvents);
      }

      if (this.options.saveEvents) {
        this.saveEvents();
      }

      this._sendEventsIfReady(callback);

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
      var deletedEvents = queue.splice(0, queue.length - this.options.savedMaxCount);
      deletedEvents.forEach(function (event) {
        if (type(event.callback) === 'function') {
          event.callback(0, 'No request sent', {
            reason: 'Event dropped because options.savedMaxCount exceeded. User may be offline or have a content blocker'
          });
        }
      });
    }
  };
  /**
   * This is the callback for logEvent and identify calls. It gets called after the event/identify is uploaded,
   * and the server response code and response body from the upload request are passed to the callback function.
   * @callback Amplitude~eventCallback
   * @param {number} responseCode - Server response code for the event / identify upload request.
   * @param {string} responseBody - Server response body for the event / identify upload request.
   * @param {object} details - (optional) Additional information associated with sending event.
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
    if (this._shouldDeferCall()) {
      return this._q.push(['logEvent'].concat(Array.prototype.slice.call(arguments, 0)));
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
    if (this._shouldDeferCall()) {
      return this._q.push(['logEventWithTimestamp'].concat(Array.prototype.slice.call(arguments, 0)));
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
   *
   * See the [advanced topics article](https://developers.amplitude.com/docs/setting-user-groups) for more information.
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
    if (this._shouldDeferCall()) {
      return this._q.push(['logEventWithGroups'].concat(Array.prototype.slice.call(arguments, 0)));
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
   * Test that n is a number or a numeric value.
   * @private
   */


  var _isNumber = function _isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  /**
   * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
   * revenueType and event properties.
   *
   * See the [Revenue](https://amplitude.github.io/Amplitude-JavaScript/Revenue/)
   * reference page for more information on the Revenue interface and logging revenue.
   * @public
   * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
   * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
   * amplitude.logRevenueV2(revenue);
   */


  AmplitudeClient.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
    if (this._shouldDeferCall()) {
      return this._q.push(['logRevenueV2'].concat(Array.prototype.slice.call(arguments, 0)));
    }

    if (!this._apiKeySet('logRevenueV2()')) {
      return;
    } // if revenue input is a proxied object created by the async loading snippet, convert it into an revenue object


    if (type(revenue_obj) === 'object' && Object.prototype.hasOwnProperty.call(revenue_obj, '_q')) {
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

  {
    /**
     * Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2
     * @public
     * @deprecated
     * @param {number} price - price of revenue event
     * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
     * @param {string} product - (optional) product identifier
     * @example amplitudeClient.logRevenue(3.99, 1, 'product_1234');
     */
    AmplitudeClient.prototype.logRevenue = function logRevenue(price, quantity, product) {
      if (this._shouldDeferCall()) {
        return this._q.push(['logRevenue'].concat(Array.prototype.slice.call(arguments, 0)));
      } // Test that the parameters are of the right type.


      if (!this._apiKeySet('logRevenue()') || !_isNumber(price) || quantity !== undefined && !_isNumber(quantity)) {
        // utils.log('Price and quantity arguments to logRevenue must be numbers');
        return -1;
      }

      return this._logEvent(Constants.REVENUE_EVENT, {}, {
        productId: product,
        special: 'revenue_amount',
        quantity: quantity || 1,
        price: price
      }, null, null, null, null, null);
    };
  }
  /**
   * Remove events in storage with event ids up to and including maxEventId.
   * @private
   */


  AmplitudeClient.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId, status, response) {
    _removeEvents(this, '_unsentEvents', maxEventId, status, response);

    _removeEvents(this, '_unsentIdentifys', maxIdentifyId, status, response);
  };
  /**
   * Helper function to remove events up to maxId from a single queue.
   * Does a true filter in case events get out of order or old events are removed.
   * @private
   */


  var _removeEvents = function _removeEvents(scope, eventQueue, maxId, status, response) {
    if (maxId < 0) {
      return;
    }

    var filteredEvents = [];

    for (var i = 0; i < scope[eventQueue].length || 0; i++) {
      var unsentEvent = scope[eventQueue][i];

      if (unsentEvent.event.event_id > maxId) {
        filteredEvents.push(unsentEvent);
      } else {
        if (unsentEvent.callback) {
          unsentEvent.callback(status, response);
        }
      }
    }

    scope[eventQueue] = filteredEvents;
  };
  /**
   * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
   * If batchEvents is true, then events are only sent when batch criterias are met.
   * @private
   */


  AmplitudeClient.prototype.sendEvents = function sendEvents() {
    if (!this._apiKeySet('sendEvents()')) {
      this.removeEvents(Infinity, Infinity, 0, 'No request sent', {
        reason: 'API key not set'
      });
      return;
    }

    if (this.options.optOut) {
      this.removeEvents(Infinity, Infinity, 0, 'No request sent', {
        reason: 'Opt out is set to true'
      });
      return;
    } // How is it possible to get into this state?


    if (this._unsentCount() === 0) {
      return;
    } // We only make one request at a time. sendEvents will be invoked again once
    // the last request completes.


    if (this._sending) {
      return;
    }

    this._sending = true;
    var protocol = this.options.forceHttps ? 'https' : 'https:' === window.location.protocol ? 'https' : 'http';
    var url = protocol + '://' + this.options.apiEndpoint; // fetch events to send

    var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);

    var mergedEvents = this._mergeEventsAndIdentifys(numEvents);

    var maxEventId = mergedEvents.maxEventId;
    var maxIdentifyId = mergedEvents.maxIdentifyId;
    var events = JSON.stringify(mergedEvents.eventsToSend.map(function (_ref2) {
      var event = _ref2.event;
      return event;
    }));
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
          scope.removeEvents(maxEventId, maxIdentifyId, status, response); // Update the event cache after the removal of sent events.

          if (scope.options.saveEvents) {
            scope.saveEvents();
          } // Send more events if any queued during previous send.


          scope._sendEventsIfReady(); // handle payload too large

        } else if (status === 413) {
          // utils.log('request too large');
          // Can't even get this one massive event through. Drop it, even if it is an identify.
          if (scope.options.uploadBatchSize === 1) {
            scope.removeEvents(maxEventId, maxIdentifyId, status, response);
          } // The server complained about the length of the request. Backoff and try again.


          scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
          scope.sendEvents();
        } // else {
        //  all the events are still queued, and will be retried when the next
        //  event is sent In the interest of debugging, it would be nice to have
        //  something like an event emitter for a better debugging experince
        //  here.
        // }

      } catch (e) {// utils.log.error('failed upload');
      }
    });
  };
  /**
   * Merge unsent events and identifys together in sequential order based on their sequence number, for uploading.
   * Identifys given higher priority than Events. Also earlier sequence given priority
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
      var unsentEvent = void 0;
      var noIdentifys = identifyIndex >= this._unsentIdentifys.length;
      var noEvents = eventIndex >= this._unsentEvents.length; // case 0: no events or identifys left
      // note this should not happen, this means we have less events and identifys than expected

      if (noEvents && noIdentifys) {
        utils.log.error('Merging Events and Identifys, less events and identifys than expected');
        break;
      } // case 1: no identifys - grab from events
      else if (noIdentifys) {
          unsentEvent = this._unsentEvents[eventIndex++];
          maxEventId = unsentEvent.event.event_id; // case 2: no events - grab from identifys
        } else if (noEvents) {
          unsentEvent = this._unsentIdentifys[identifyIndex++];
          maxIdentifyId = unsentEvent.event.event_id; // case 3: need to compare sequence numbers
        } else {
          // events logged before v2.5.0 won't have a sequence number, put those first
          if (!('sequence_number' in this._unsentEvents[eventIndex].event) || this._unsentEvents[eventIndex].event.sequence_number < this._unsentIdentifys[identifyIndex].event.sequence_number) {
            unsentEvent = this._unsentEvents[eventIndex++];
            maxEventId = unsentEvent.event.event_id;
          } else {
            unsentEvent = this._unsentIdentifys[identifyIndex++];
            maxIdentifyId = unsentEvent.event.event_id;
          }
        }

      eventsToSend.push(unsentEvent);
    }

    return {
      eventsToSend: eventsToSend,
      maxEventId: maxEventId,
      maxIdentifyId: maxIdentifyId
    };
  };

  {
    /**
     * Set global user properties. Note this is deprecated, and we recommend using setUserProperties
     * @public
     * @deprecated
     */
    AmplitudeClient.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
      this.setUserProperties(userProperties);
    };
  }
  /**
   * Get the current version of Amplitude's Javascript SDK.
   * @public
   * @returns {number} version number
   * @example var amplitudeVersion = amplitude.__VERSION__;
   */


  AmplitudeClient.prototype.__VERSION__ = version;
  /**
   * Determines whether or not to push call to this._q or invoke it
   * @private
   */

  AmplitudeClient.prototype._shouldDeferCall = function _shouldDeferCall() {
    return this._pendingReadStorage || this._initializationDeferred;
  };
  /**
   * Defers Initialization by putting all functions into storage until users
   * have accepted terms for tracking
   * @private
   */


  AmplitudeClient.prototype._deferInitialization = function _deferInitialization() {
    this._initializationDeferred = true;

    this._q.push(['init'].concat(Array.prototype.slice.call(arguments, 0)));
  };
  /**
   * Enable tracking via logging events and dropping a cookie
   * Intended to be used with the deferInitialization configuration flag
   * This will drop a cookie and reset initialization deferred
   * @public
   */


  AmplitudeClient.prototype.enableTracking = function enableTracking() {
    // This will call init (which drops the cookie) and will run any pending tasks
    this._initializationDeferred = false;

    _saveCookieData(this);

    this.runQueuedFunctions();
  };

  /**
   * Deprecated legacy API of the Amplitude JS SDK - instance manager.
   *
   * Wraps around the current [AmplitudeClient](https://amplitude.github.io/Amplitude-JavaScript/) which provides more features
   * Function calls directly on amplitude have been deprecated. Please call methods on the default shared instance: amplitude.getInstance() instead.
   *
   * See the [3.0.0 changelog](https://github.com/amplitude/Amplitude-JavaScript/blob/ed405afb5f06d5cf5b72539a5d09179abcf7e1fe/README.md#300-update-and-logging-events-to-multiple-amplitude-apps) for more information about this change.
   * @constructor Amplitude
   * @public
   * @deprecated
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

  {
    /**
     * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
     * This is required before any other methods can be called.
     * @public
     * @param {string} apiKey - The API key for your app.
     * @param {string} opt_userId - (optional) An identifier for this user.
     * @param {object} opt_config - (optional) Configuration options.
     * See [options.js](https://github.com/amplitude/Amplitude-JavaScript/blob/master/src/options.js#L14) for list of options and default values.
     * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
     * @deprecated Please use amplitude.getInstance().init(apiKey, opt_userId, opt_config, opt_callback);
     * @example amplitude.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
     */
    Amplitude.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
      this.getInstance().init(apiKey, opt_userId, opt_config, function (instance) {
        // make options such as deviceId available for callback functions
        this.options = instance.options;

        if (type(opt_callback) === 'function') {
          opt_callback(instance);
        }
      }.bind(this));
    };
    /**
     * Returns true if a new session was created during initialization, otherwise false.
     * @public
     * @return {boolean} Whether a new session was created during initialization.
     * @deprecated Please use amplitude.getInstance().isNewSession();
     */


    Amplitude.prototype.isNewSession = function isNewSession() {
      return this.getInstance().isNewSession();
    };
    /**
     * Returns the id of the current session.
     * @public
     * @return {number} Id of the current session.
     * @deprecated Please use amplitude.getInstance().getSessionId();
     */


    Amplitude.prototype.getSessionId = function getSessionId() {
      return this.getInstance().getSessionId();
    };
    /**
     * Increments the eventId and returns it.
     * @private
     */


    Amplitude.prototype.nextEventId = function nextEventId() {
      return this.getInstance().nextEventId();
    };
    /**
     * Increments the identifyId and returns it.
     * @private
     */


    Amplitude.prototype.nextIdentifyId = function nextIdentifyId() {
      return this.getInstance().nextIdentifyId();
    };
    /**
     * Increments the sequenceNumber and returns it.
     * @private
     */


    Amplitude.prototype.nextSequenceNumber = function nextSequenceNumber() {
      return this.getInstance().nextSequenceNumber();
    };
    /**
     * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
     * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
     * @private
     */


    Amplitude.prototype.saveEvents = function saveEvents() {
      this.getInstance().saveEvents();
    };
    /**
     * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
     * @public
     * @param {string} domain to set.
     * @deprecated Please use amplitude.getInstance().setDomain(domain);
     * @example amplitude.setDomain('.amplitude.com');
     */


    Amplitude.prototype.setDomain = function setDomain(domain) {
      this.getInstance().setDomain(domain);
    };
    /**
     * Sets an identifier for the current user.
     * @public
     * @param {string} userId - identifier to set. Can be null.
     * @deprecated Please use amplitude.getInstance().setUserId(userId);
     * @example amplitude.setUserId('joe@gmail.com');
     */


    Amplitude.prototype.setUserId = function setUserId(userId) {
      this.getInstance().setUserId(userId);
    };
    /**
     * Add user to a group or groups. You need to specify a groupType and groupName(s).
     * For example you can group people by their organization.
     * In that case groupType is "orgId" and groupName would be the actual ID(s).
     * groupName can be a string or an array of strings to indicate a user in multiple gruups.
     * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
     * Note: this will also set groupType: groupName as a user property.
     * See the [advanced topics article](https://developers.amplitude.com/docs/setting-user-groups) for more information.
     * @public
     * @param {string} groupType - the group type (ex: orgId)
     * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
     * @deprecated Please use amplitude.getInstance().setGroup(groupType, groupName);
     * @example amplitude.setGroup('orgId', 15); // this adds the current user to orgId 15.
     */


    Amplitude.prototype.setGroup = function (groupType, groupName) {
      this.getInstance().setGroup(groupType, groupName);
    };
    /**
     * Sets whether to opt current user out of tracking.
     * @public
     * @param {boolean} enable - if true then no events will be logged or sent.
     * @deprecated Please use amplitude.getInstance().setOptOut(enable);
     * @example: amplitude.setOptOut(true);
     */


    Amplitude.prototype.setOptOut = function setOptOut(enable) {
      this.getInstance().setOptOut(enable);
    };
    /**
     * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
     * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
     * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
     * This uses src/uuid.js to regenerate the deviceId.
     * @public
     * @deprecated Please use amplitude.getInstance().regenerateDeviceId();
     */


    Amplitude.prototype.regenerateDeviceId = function regenerateDeviceId() {
      this.getInstance().regenerateDeviceId();
    };
    /**
     * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
     * (like if you have your own system for managing deviceIds).
     *
     * Make sure the deviceId you set is sufficiently unique
     * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
     * @public
     * @param {string} deviceId - custom deviceId for current user.
     * @deprecated Please use amplitude.getInstance().setDeviceId(deviceId);
     * @example amplitude.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
     */


    Amplitude.prototype.setDeviceId = function setDeviceId(deviceId) {
      this.getInstance().setDeviceId(deviceId);
    };
    /**
     * Sets user properties for the current user.
     * @public
     * @param {object} userProperties - object with string keys and values for the user properties to set.
     * @param {boolean} opt_replace - Deprecated. In earlier versions of the JS SDK the user properties object was kept in
     * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
     * @deprecated Please use amplitude.getInstance().setUserProperties(userProperties);
     * @example amplitude.setUserProperties({'gender': 'female', 'sign_up_complete': true})
     */


    Amplitude.prototype.setUserProperties = function setUserProperties(userProperties) {
      this.getInstance().setUserProperties(userProperties);
    };
    /**
     * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
     * @public
     * @deprecated Please use amplitude.getInstance().clearUserProperties();
     * @example amplitude.clearUserProperties();
     */


    Amplitude.prototype.clearUserProperties = function clearUserProperties() {
      this.getInstance().clearUserProperties();
    };
    /**
     * Send an identify call containing user property operations to Amplitude servers.
     * See the [Identify](https://amplitude.github.io/Amplitude-JavaScript/Identify/)
     * reference page for more information on the Identify API and user property operations.
     * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
     * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
     * Note: the server response code and response body from the identify event upload are passed to the callback function.
     * @deprecated Please use amplitude.getInstance().identify(identify);
     * @example
     * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
     * amplitude.identify(identify);
     */


    Amplitude.prototype.identify = function (identify_obj, opt_callback) {
      this.getInstance().identify(identify_obj, opt_callback);
    };
    /**
     * Set a versionName for your application.
     * @public
     * @param {string} versionName - The version to set for your application.
     * @deprecated Please use amplitude.getInstance().setVersionName(versionName);
     * @example amplitude.setVersionName('1.12.3');
     */


    Amplitude.prototype.setVersionName = function setVersionName(versionName) {
      this.getInstance().setVersionName(versionName);
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
     * @deprecated Please use amplitude.getInstance().logEvent(eventType, eventProperties, opt_callback);
     * @example amplitude.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
     */


    Amplitude.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
      return this.getInstance().logEvent(eventType, eventProperties, opt_callback);
    };
    /**
     * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
     *
     * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
     * (unless you explicitly set it with setGroup).
     *
     * See the [advanced topics article](https://developers.amplitude.com/docs/setting-user-groups) for more information.
     * about groups and Count by Distinct on the Amplitude platform.
     * @public
     * @param {string} eventType - name of event
     * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
     * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
     * groupName can be a string or an array of strings.
     * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
     * Note: the server response code and response body from the event upload are passed to the callback function.
     * @deprecated Please use amplitude.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
     * @example amplitude.logEventWithGroups('Clicked Button', null, {'orgId': 24});
     */


    Amplitude.prototype.logEventWithGroups = function (eventType, eventProperties, groups, opt_callback) {
      return this.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
    };
    /**
     * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
     * revenueType and event properties.
     *
     * See the [Revenue](https://amplitude.github.io/Amplitude-JavaScript/Revenue/)
     * reference page for more information on the Revenue interface and logging revenue.
     * @public
     * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
     * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
     * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
     * amplitude.logRevenueV2(revenue);
     */


    Amplitude.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
      return this.getInstance().logRevenueV2(revenue_obj);
    };
    /**
     * Log revenue event with a price, quantity, and product identifier.
     * @public
     * @param {number} price - price of revenue event
     * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
     * @param {string} product - (optional) product identifier
     * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
     * @example amplitude.logRevenue(3.99, 1, 'product_1234');
     */


    Amplitude.prototype.logRevenue = function logRevenue(price, quantity, product) {
      return this.getInstance().logRevenue(price, quantity, product);
    };
    /**
     * Remove events in storage with event ids up to and including maxEventId.
     * @private
     */


    Amplitude.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
      this.getInstance().removeEvents(maxEventId, maxIdentifyId);
    };
    /**
     * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
     * If batchEvents is true, then events are only sent when batch criterias are met.
     * @private
     * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
     * Note the server response code and response body are passed to the callback as input arguments.
     */


    Amplitude.prototype.sendEvents = function sendEvents(callback) {
      this.getInstance().sendEvents(callback);
    };
    /**
     * Set global user properties.
     * @public
     * @deprecated Please use amplitudeClient.setUserProperties
     */


    Amplitude.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
      this.getInstance().setUserProperties(userProperties);
    };
  }
  /**
   * Get the current version of Amplitude's Javascript SDK.
   * @public
   * @returns {number} version number
   * @example var amplitudeVersion = amplitude.__VERSION__;
   */


  Amplitude.prototype.__VERSION__ = version;

  // Entry point
  var old = window.amplitude || {};
  var newInstance = new Amplitude();
  newInstance._q = old._q || [];
  /**
   * Instantiates Amplitude object and runs all queued function logged by stubbed methods provided by snippets
   * Event queue allows async loading of SDK to not blocking client's app
   */

  for (var instance in old._iq) {
    // migrate each instance's queue
    if (Object.prototype.hasOwnProperty.call(old._iq, instance)) {
      newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
    }
  } // If SDK is enabled as snippet, process the events queued by stubbed function

  return newInstance;

}));
