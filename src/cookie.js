/*
 * Cookie data
 */

import Base64 from './base64';
import utils from './utils';
import baseCookie from './base-cookie';
import topDomain from './top-domain';

var _options = {
  expirationDays: undefined,
  domain: undefined,
};

var reset = function () {
  _options = {
    expirationDays: undefined,
    domain: undefined,
  };
};

var options = function (opts) {
  if (arguments.length === 0) {
    return _options;
  }

  opts = opts || {};

  _options.expirationDays = opts.expirationDays;
  _options.secure = opts.secure;
  _options.sameSite = opts.sameSite;

  var domain = !utils.isEmptyString(opts.domain) ? opts.domain : '.' + topDomain(utils.getLocation().href);
  var token = Math.random();
  _options.domain = domain;
  set('amplitude_test', token);
  var stored = get('amplitude_test');
  if (!stored || stored !== token) {
    domain = null;
  }
  remove('amplitude_test');
  _options.domain = domain;

  return _options;
};

var _domainSpecific = function (name) {
  // differentiate between cookies on different domains
  var suffix = '';
  if (_options.domain) {
    suffix = _options.domain.charAt(0) === '.' ? _options.domain.substring(1) : _options.domain;
  }
  return name + suffix;
};

var get = function (name) {
  var nameEq = _domainSpecific(name) + '=';
  const value = baseCookie.get(nameEq);

  try {
    if (value) {
      return JSON.parse(Base64.decode(value));
    }
  } catch (e) {
    return null;
  }

  return null;
};

var set = function (name, value) {
  try {
    baseCookie.set(_domainSpecific(name), Base64.encode(JSON.stringify(value)), _options);
    return true;
  } catch (e) {
    return false;
  }
};

var setRaw = function (name, value) {
  try {
    baseCookie.set(_domainSpecific(name), value, _options);
    return true;
  } catch (e) {
    return false;
  }
};

var getRaw = function (name) {
  var nameEq = _domainSpecific(name) + '=';
  return baseCookie.get(nameEq);
};

var remove = function (name) {
  try {
    baseCookie.set(_domainSpecific(name), null, _options);
    return true;
  } catch (e) {
    return false;
  }
};

export default {
  reset,
  options,
  get,
  set,
  remove,
  setRaw,
  getRaw,
};
