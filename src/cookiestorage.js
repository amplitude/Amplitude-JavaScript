/*
 * Abstraction layer for cookie storage.
 * Uses cookie if available, otherwise fallback to localstorage.
 */

import Cookie from './cookie';
import localStorage from './localstorage';
import baseCookie from './base-cookie';
import GlobalScope from './global-scope';

var cookieStorage = function () {
  this.storage = null;
};

cookieStorage.prototype.getStorage = function (disableCookies) {
  if (this.storage !== null) {
    return this.storage;
  }

  if (!disableCookies && baseCookie.areCookiesEnabled()) {
    this.storage = Cookie;
  } else {
    // if cookies disabled, fallback to localstorage
    // note: localstorage does not persist across subdomains
    var keyPrefix = 'amp_cookiestore_';
    this.storage = {
      _options: {
        expirationDays: undefined,
        domain: undefined,
        secure: false,
      },
      reset: function () {
        this._options = {
          expirationDays: undefined,
          domain: undefined,
          secure: false,
        };
      },
      options: function (opts) {
        if (arguments.length === 0) {
          return this._options;
        }
        opts = opts || {};
        this._options.expirationDays = opts.expirationDays || this._options.expirationDays;
        // localStorage is specific to subdomains
        this._options.domain =
          opts.domain || this._options.domain || (GlobalScope && GlobalScope.location && GlobalScope.location.hostname);
        return (this._options.secure = opts.secure || false);
      },
      get: function (name) {
        try {
          return JSON.parse(localStorage.getItem(keyPrefix + name));
        } catch (e) {} /* eslint-disable-line no-empty */
        return null;
      },
      set: function (name, value) {
        try {
          localStorage.setItem(keyPrefix + name, JSON.stringify(value));
          return true;
        } catch (e) {} /* eslint-disable-line no-empty */
        return false;
      },
      remove: function (name) {
        try {
          localStorage.removeItem(keyPrefix + name);
        } catch (e) {
          return false;
        }
      },
    };
  }

  return this.storage;
};

export default cookieStorage;
