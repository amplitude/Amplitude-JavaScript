import constants from './constants';
import GlobalScope from './global-scope';
import type from './type';

var logLevels = {
  DISABLE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
};

let logLevel = logLevels.WARN;

const setLogLevel = function setLogLevel(logLevelName) {
  if (Object.prototype.hasOwnProperty.call(logLevels, logLevelName)) {
    logLevel = logLevels[logLevelName];
  }
};

const getLogLevel = function getLogLevel() {
  return logLevel;
};

const log = {
  error: (s) => {
    if (logLevel >= logLevels.ERROR) {
      _log(s);
    }
  },

  warn: (s) => {
    if (logLevel >= logLevels.WARN) {
      _log(s);
    }
  },

  info: (s) => {
    if (logLevel >= logLevels.INFO) {
      _log(s);
    }
  },
};

var _log = function _log(s) {
  try {
    console.log('[Amplitude] ' + s);
  } catch (e) {
    // console logging not available
  }
};

var isEmptyString = function isEmptyString(str) {
  return !str || str.length === 0;
};

var sessionStorageEnabled = function sessionStorageEnabled() {
  try {
    if (GlobalScope.sessionStorage) {
      return true;
    }
  } catch (e) {
    // sessionStorage disabled
  }
  return false;
};

// truncate string values in event and user properties so that request size does not get too large
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
    return value.length > constants.MAX_STRING_LENGTH ? value.substring(0, constants.MAX_STRING_LENGTH) : value;
  }
  return value;
};

var validateInput = function validateInput(input, name, expectedType) {
  if (type(input) !== expectedType) {
    log.error('Invalid ' + name + ' input type. Expected ' + expectedType + ' but received ' + type(input));
    return false;
  }
  return true;
};

const validateDeviceId = function validateDeviceId(deviceId) {
  if (!validateInput(deviceId, 'deviceId', 'string')) {
    return false;
  }
  if (deviceId.indexOf('.') >= 0) {
    log.error(`Device IDs may not contain '.' characters. Value will be ignored: "${deviceId}"`);
    return false;
  }
  return true;
};

const validateTransport = function validateTransport(transport) {
  if (!validateInput(transport, 'transport', 'string')) {
    return false;
  }

  if (transport !== constants.TRANSPORT_HTTP && transport !== constants.TRANSPORT_BEACON) {
    log.error(`transport value must be one of '${constants.TRANSPORT_BEACON}' or '${constants.TRANSPORT_HTTP}'`);
    return false;
  }

  if (transport !== constants.TRANSPORT_HTTP && typeof navigator !== 'undefined' && !navigator.sendBeacon) {
    log.error(`browser does not support sendBeacon, so transport must be HTTP`);
    return false;
  }
  return true;
};

// do some basic sanitization and type checking, also catch property dicts with more than 1000 key/value pairs
var validateProperties = function validateProperties(properties) {
  var propsType = type(properties);
  if (propsType !== 'object') {
    log.error('Error: invalid properties format. Expecting Javascript object, received ' + propsType + ', ignoring');
    return {};
  }

  if (Object.keys(properties).length > constants.MAX_PROPERTY_KEYS) {
    log.error('Error: too many properties (more than 1000), ignoring');
    return {};
  }

  var copy = {}; // create a copy with all of the valid properties
  for (var property in properties) {
    if (!Object.prototype.hasOwnProperty.call(properties, property)) {
      continue;
    }

    // validate key
    var key = property;
    var keyType = type(key);
    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string property key, received type ' + keyType + ', coercing to string "' + key + '"');
    }

    // validate value
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
    }

    // validate key
    var key = group;
    var keyType = type(key);
    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string groupType, received type ' + keyType + ', coercing to string "' + key + '"');
    }

    // validate value
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
    log.warn(
      'WARNING: Non-string groupName, received type ' + groupNameType + ', coercing to string "' + groupName + '"',
    );
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
  log.warn(
    'WARNING: Non-string groupName, received type ' +
      groupNameType +
      '. Please use strings or array of strings for groupName',
  );
};

// parses the value of a url param (for example ?gclid=1234&...)
var getQueryParam = function getQueryParam(name, query) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(query);
  return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

const isWebWorkerEnvironment = () => {
  return typeof WorkerGlobalScope !== 'undefined';
};

const validateSessionId = (sessionId) => {
  if (validateInput(sessionId, 'sessionId', 'number') && new Date(sessionId).getTime() > 0) {
    return true;
  }

  log.error(`sessionId value must in milliseconds since epoch (Unix Timestamp)`);
  return false;
};

const getLocation = () => {
  return GlobalScope.location;
};

const getHost = (url) => {
  const defaultHostname = GlobalScope.location ? GlobalScope.location.hostname : '';
  if (url) {
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      return a.hostname || defaultHostname;
    }
    if (typeof URL === 'function') {
      const u = new URL(url);
      return u.hostname || defaultHostname;
    }
  }
  return defaultHostname;
};

export default {
  setLogLevel,
  getLogLevel,
  logLevels,
  log,
  isEmptyString,
  isWebWorkerEnvironment,
  getQueryParam,
  sessionStorageEnabled,
  truncate,
  validateGroups,
  validateInput,
  validateProperties,
  validateDeviceId,
  validateTransport,
  validateSessionId,
  getLocation,
  getHost,
};
