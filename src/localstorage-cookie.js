/* jshint -W020, -W001, unused: false, noempty: false, boss: true */
/* global escape, unescape */

// Cookie polyfill from https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
// Added restriction on data size.
var cookieStorage = {
  length: 0,
  getItem: function (sKey) {
    if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  key: function (nKeyId) {
    return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
  },
  setItem: function (sKey, sValue) {
    if(!sKey) { return; }

    // Restrict total size of storage to 4k.
    // If we had to fall all the way back to cookie storage, this is very old or
    // restricted browser and likely doesn't have much cookie storage.
    // Large values were always stored in local storage and would have
    // been ephemeral anyway. Also better not to send all that data across the wire.
    var existing = cookieStorage.getItem(sKey);
    var itemLength = escape(sKey).length + escape(sValue).length - (existing && escape(existing).length || 0);
    if (document.cookie.length + itemLength > 4*1024) { return; }

    document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
    this.length = document.cookie.match(/\=/g).length;
  },
  removeItem: function (sKey) {
    if (!sKey || !this.hasOwnProperty(sKey)) { return; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    this.length--;
  },
  hasOwnProperty: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  }
};
cookieStorage.length = (document.cookie.match(/\=/g) || cookieStorage).length;

module.exports = cookieStorage;
