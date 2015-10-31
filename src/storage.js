/* jshint -W020, unused: false, noempty: false, boss: true */

/*
 * Wrapper to determine best storage to use. In most cases
 * localStorage is good, although if it is unavailable, then
 * fall back to using global storage, html div, or cookies.
 * Implement localStorage to support Firefox 2-3 and IE 5-7.
 */
var storage = function() {
  this.storage = null;
};

// test that Window.localStorage is available and works
storage.prototype._windowLocalStorageAvailable = function() {
  var uid = new Date();
  var result;
  try {
    window.localStorage.setItem(uid, uid);
    result = window.localStorage.getItem(uid) === String(uid);
    window.localStorage.removeItem(uid);
    return result;
  } catch (e) {
    // localStorage not available
  }
  return false;
};

storage.prototype.getStorage = function() {
  if (this.storage !== null) {
    return this.storage;
  }

  if (this._windowLocalStorageAvailable()) {
    this.storage = window.localStorage;
  } else if (window.globalStorage) {
    // Firefox 2-3 use globalStorage
    // See https://developer.mozilla.org/en/dom/storage#globalStorage
    try {
      this.storage = window.globalStorage[window.location.hostname];
    } catch (e) {
      // Something bad happened...
    }
  } else {
    // IE 5-7 use userData
    // See http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
    var div = document.createElement('div'),
        attrKey = 'localStorage';
    div.style.display = 'none';
    document.getElementsByTagName('head')[0].appendChild(div);
    if (div.addBehavior) {
      div.addBehavior('#default#userdata');
      this.storage = {
        length: 0,
        setItem: function(k, v) {
          div.load(attrKey);
          if (!div.getAttribute(k)) {
            this.length++;
          }
          div.setAttribute(k, v);
          div.save(attrKey);
        },
        getItem: function(k) {
          div.load(attrKey);
          return div.getAttribute(k);
        },
        removeItem: function(k) {
          div.load(attrKey);
          if (div.getAttribute(k)) {
            this.length--;
          }
          div.removeAttribute(k);
          div.save(attrKey);
        },
        clear: function() {
          div.load(attrKey);
          var i = 0;
          var attr;
          while (attr = div.XMLDocument.documentElement.attributes[i++]) {
            div.removeAttribute(attr.name);
          }
          div.save(attrKey);
          this.length = 0;
        },
        key: function(k) {
          div.load(attrKey);
          return div.XMLDocument.documentElement.attributes[k];
        }
      };
      div.load(attrKey);
      this.storage.length = div.XMLDocument.documentElement.attributes.length;
    } else {
      this.storage = require('./localstorage-cookie.js');
    }
  }
  if (!this.storage) {
    this.storage = {
      length: 0,
      setItem: function(k, v) {
      },
      getItem: function(k) {
      },
      removeItem: function(k) {
      },
      clear: function() {
      },
      key: function(k) {
      }
    };
  }
  return this.storage;
};

module.exports = storage;
