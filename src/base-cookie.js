import Constants from './constants';
import base64Id from './base64Id';
import utils from './utils';

const get = (name) => {
  try {
    const ca = document.cookie.split(';');
    let value = null;
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(name) === 0) {
        value = c.substring(name.length, c.length);
        break;
      }
    }

    return value;
  } catch (e) {
    return null;
  }
};

const set = (name, value, opts) => {
  let expires = value !== null ? opts.expirationDays : -1;
  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    expires = date;
  }
  let str = name + '=' + value;
  if (expires) {
    str += '; expires=' + expires.toUTCString();
  }
  str += '; path=/';
  if (opts.domain) {
    str += '; domain=' + opts.domain;
  }
  if (opts.secure) {
    str += '; Secure';
  }
  if (opts.sameSite) {
    str += '; SameSite=' + opts.sameSite;
  }
  document.cookie = str;
};

// test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly
const areCookiesEnabled = (opts = {}) => {
  utils.log.info(`Testing if cookies available`);
  const cookieName = Constants.COOKIE_TEST_PREFIX + base64Id();
  let _areCookiesEnabled = false;
  try {
    const uid = String(new Date());
    set(cookieName, uid, opts);
    _areCookiesEnabled = get(cookieName + '=') === uid;
  } catch (e) {
    utils.log.info(`Cookies are unavailable. Reason: "${e}"`);
  } finally {
    utils.log.info(`Cleaning up cookies availability test`);
    set(cookieName, null, opts);
  }
  return _areCookiesEnabled;
};

export default {
  set,
  get,
  areCookiesEnabled,
};
