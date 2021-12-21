/*
 * Implement localStorage to support Firefox 2-3 and IE 5-7
 */

import GlobalScope from './global-scope';
import WorkerStorage from './worker-storage';
import utils from './utils';

var localStorage;

if (!BUILD_COMPAT_LOCAL_STORAGE) {
  localStorage = GlobalScope.localStorage;
}

if (BUILD_COMPAT_LOCAL_STORAGE) {
  // test that Window.localStorage is available and works
  const windowLocalStorageAvailable = () => {
    var uid = new Date();
    var result;
    try {
      GlobalScope.localStorage.setItem(uid, uid);
      result = GlobalScope.localStorage.getItem(uid) === String(uid);
      GlobalScope.localStorage.removeItem(uid);
      return result;
    } catch (e) {
      // localStorage not available
    }
    return false;
  };

  if (windowLocalStorageAvailable()) {
    localStorage = GlobalScope.localStorage;
  } else if (typeof GlobalScope !== 'undefined' && GlobalScope.globalStorage) {
    // Firefox 2-3 use globalStorage
    // See https://developer.mozilla.org/en/dom/storage#globalStorage
    try {
      localStorage = GlobalScope.globalStorage[GlobalScope.location.hostname];
    } catch (e) {
      // Something bad happened...
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
        setItem: function (k, v) {
          div.load(attrKey);
          if (!div.getAttribute(k)) {
            this.length++;
          }
          div.setAttribute(k, v);
          div.save(attrKey);
        },
        getItem: function (k) {
          div.load(attrKey);
          return div.getAttribute(k);
        },
        removeItem: function (k) {
          div.load(attrKey);
          if (div.getAttribute(k)) {
            this.length--;
          }
          div.removeAttribute(k);
          div.save(attrKey);
        },
        clear: function () {
          div.load(attrKey);
          var i = 0;
          var attr;
          while ((attr = div.XMLDocument.documentElement.attributes[i++])) {
            div.removeAttribute(attr.name);
          }
          div.save(attrKey);
          this.length = 0;
        },
        key: function (k) {
          div.load(attrKey);
          return div.XMLDocument.documentElement.attributes[k];
        },
      };
      div.load(attrKey);
      localStorage.length = div.XMLDocument.documentElement.attributes.length;
    } else {
      /* Nothing we can do ... */
    }
  } else if (utils.isWebWorkerEnvironment()) {
    // Web worker
    localStorage = new WorkerStorage();
  }
  if (!localStorage) {
    /* eslint-disable no-unused-vars */
    localStorage = {
      length: 0,
      setItem: function (k, v) {},
      getItem: function (k) {},
      removeItem: function (k) {},
      clear: function () {},
      key: function (k) {},
    };
    /* eslint-enable no-unused-vars */
  }
}

export default localStorage;
