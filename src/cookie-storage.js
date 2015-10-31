/* jshint -W020, unused: false, noempty: false, boss: true */
/* global escape, unescape */

var Cookie = require('./cookie.js');

var COOKIE_STORAGE_KEY = 'amplitude_storage';

var cookieStorage = {
  length: 0,

  setItem: function(sKey, sValue) {
    var store = Cookie.get(COOKIE_STORAGE_KEY) || {};

    // don't add if cookie size exceeds 4k
    var existingValue = '';
    if (store.hasOwnProperty(sKey)) { existingValue = store[sKey]; }
    var itemLength = escape(sKey).length + escape(sValue).length - escape(existingValue).length;
    if (document.cookie.length + itemLength > 4*1024) { return; }

    if (!store.hasOwnProperty(sKey)) { this.length++; }
    store[sKey] = sValue;
    Cookie.set(COOKIE_STORAGE_KEY, store);
  },

  getItem: function(sKey) {
    var store = Cookie.get(COOKIE_STORAGE_KEY);
    return store && store.hasOwnProperty(sKey) && store[sKey] || null;
  },

  removeItem: function(sKey) {
    var store = Cookie.get(COOKIE_STORAGE_KEY);
    if (!store || !store.hasOwnProperty(sKey)) { return; }
    delete store[sKey];
    Cookie.set(COOKIE_STORAGE_KEY, store);
    this.length--;
  },

  clear: function() {
    Cookie.set(COOKIE_STORAGE_KEY, {});
    this.length = 0;
  },

  key: function(n) {
    var store = Cookie.get(COOKIE_STORAGE_KEY);
    if (!store) { return null; }
    var keys = Object.keys(store);
    return n < keys.length && keys[n] || null;
  }
};

module.exports = cookieStorage;
