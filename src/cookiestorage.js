/* jshint -W020, unused: false, noempty: false, boss: true */

/*
 * Abstraction layer for cookie storage.
 * Uses cookie if available, otherwise fallback to localstorage.
 */

var Cookie = require('./cookie');
var localStorage = require('./localstorage'); // jshint ignore:line

var cookieStorage; // jshint ignore:line

// test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly
function cookiesEnabled() {
  var uid = String(new Date());
  var result;
  try {
    Cookie.set(uid, uid);
    result = Cookie.get(uid) === uid;
    Cookie.remove(uid);
    return result;
  } catch (e) {
    // cookies are not enabled
  }
  return false;
}

if (cookiesEnabled()) {
  cookieStorage = Cookie;
} else {
  // if cookies disabled, fallback to localstorage
  // note: localstorage does not persist across subdomains
  var keyPrefix = 'amp_cookiestore_';
  cookieStorage = {
    reset: function() {},
    options: function(opt) { return {}; }, // options are ignored
    get: function(name) {
      return localStorage.getItem(keyPrefix + name);
    },
    set: function(name, value) {
      try {
        localStorage.setItem(keyPrefix + name, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function(name) {
      try {
        localStorage.removeItem(keyPrefix + name);
      } catch (e) {
        return false;
      }
    }
  };
}

module.exports = cookieStorage;
