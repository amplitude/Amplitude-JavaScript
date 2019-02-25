/*
 * Cookie data
 */

import Base64 from './base64';
import utils from './utils';
import getLocation from './get-location';
import baseCookie from './base-cookie';


var _options = {
  expirationDays: undefined,
  domain: undefined
};


var reset = function() {
  _options = {
    expirationDays: undefined,
    domain: undefined
  };
};

const getHost = (url) => {
  const a = document.createElement('a');
  a.href = url;
  return a.hostname || location.hostname; 
};

const topDomain = (url) => {
  const host = getHost(url);
  const parts = host.split('.');
  const last = parts[parts.length - 1];
  const levels = [];

  if (parts.length === 4 && last === parseInt(last, 10)) {
    return levels;
  }

  if (parts.length <= 1) {
    return levels;
  }

  for (let i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  for (let i = 0; i < levels.length; ++i) {
    const cname = '__tld_test__';
    const domain = levels[i];
    const opts = { domain: '.' + domain };

    baseCookie.set(cname, 1, opts);
    if (baseCookie.get(cname)) {
      baseCookie.set(cname, null, opts);
      return domain;
    }
  }

  return '';
};


var options = function(opts) {
  if (arguments.length === 0) {
    return _options;
  }

  opts = opts || {};

  _options.expirationDays = opts.expirationDays;
  _options.secure = opts.secure;

  var domain = (!utils.isEmptyString(opts.domain)) ? opts.domain : '.' + topDomain(getLocation().href);
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

var _domainSpecific = function(name) {
  // differentiate between cookies on different domains
  var suffix = '';
  if (_options.domain) {
    suffix = _options.domain.charAt(0) === '.' ? _options.domain.substring(1) : _options.domain;
  }
  return name + suffix;
};


var get = function(name) {
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


var set = function(name, value) {
  try {
    baseCookie.set(_domainSpecific(name), Base64.encode(JSON.stringify(value)), _options);
    return true;
  } catch (e) {
    return false;
  }
};


var remove = function(name) {
  try {
    baseCookie.set(_domainSpecific(name), null, _options);
    return true;
  } catch (e) {
    return false;
  }
};


export default {
  reset: reset,
  options: options,
  get: get,
  set: set,
  remove: remove
};
