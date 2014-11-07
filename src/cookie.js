/*
 * Cookie data
 */

var Base64 = require('./base64');
var JSON = require('json');
var topDomain = require('top-domain');



var _options = {
  expirationDays: undefined,
  domain: undefined
};


var reset = function() {
  _options = {};
};


var options = function(opts) {
  if (!opts) {
    return _options;
  }
  _options.expirationDays = opts.expirationDays;

  var domain;
  if (opts.domain) {
    domain = opts.domain;
  } else {
    domain = '.' + topDomain(window.location.href);
  }

  var token = Math.random();
  _options.domain = domain;
  set('amplitude_test', token);
  var stored = get('amplitude_test');
  if (!stored || stored != token) {
    domain = null;
  }
  remove('amplitude_test');
  _options.domain = domain;
};


var get = function(name) {
  try {
    var nameEq = name + '=';
    var ca = document.cookie.split(';');
    var value = null;
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEq) == 0) {
        value = c.substring(nameEq.length, c.length);
        break;
      }
    }

    if (value) {
      return JSON.parse(Base64.decode(value));
    }
    return null;
  } catch (e) {
    return null;
  }
};


var set = function(name, value) {
  try {
    _set(name, Base64.encode(JSON.stringify(value)));
    return true;
  } catch (e) {
    return false;
  }
};


var _set = function(name, value) {
  var expires = null;
  if (_options.expirationDays) {
    var date = new Date();
    date.setTime(date.getTime() + (_options.expirationDays * 24 * 60 * 60 * 1000));
    expires = date;
  }
  var str = name + '=' + value;
  if (expires) {
    str += '; expires=' + expires.toUTCString();
  }
  str += '; path=/';
  if (_options.domain) {
    str += '; domain=' + _options.domain;
  }
  document.cookie = str;
};


var remove = function(name) {
  try {
    _set(name, '');
    return true;
  } catch (e) {
    return false;
  }
};


module.exports = {
  reset: reset,
  options: options,
  get: get,
  set: set,
  remove: remove
};
