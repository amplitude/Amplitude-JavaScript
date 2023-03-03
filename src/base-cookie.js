import Constants from './constants';
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

const getAll = (name) => {
  try {
    const cookieArray = document.cookie.split(';').map((c) => c.trimStart());
    let values = [];
    for (let cookie of cookieArray) {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        values.push(cookie.substring(name.length));
      }
    }

    return values;
  } catch (e) {
    return [];
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

const getLastEventTime = (cookie = '') => {
  const strValue = cookie.split('.')[Constants.LAST_EVENT_TIME_INDEX];

  let parsedValue;
  if (strValue) {
    parsedValue = parseInt(strValue, 32);
  }

  if (parsedValue) {
    return parsedValue;
  } else {
    utils.log.warn(`unable to parse malformed cookie: ${cookie}`);
    return 0;
  }
};

const sortByEventTime = (cookies) => {
  return [...cookies].sort((c1, c2) => {
    const t1 = getLastEventTime(c1);
    const t2 = getLastEventTime(c2);
    // sort c1 first if its last event time is more recent
    // i.e its event time integer is larger that c2's
    return t2 - t1;
  });
};

// test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly
const areCookiesEnabled = (opts = {}) => {
  const cookieName = Constants.COOKIE_TEST_PREFIX;
  if (typeof document === 'undefined') {
    return false;
  }
  let _areCookiesEnabled = false;
  try {
    const uid = String(Date.now());
    set(cookieName, uid, opts);
    utils.log.info(`Testing if cookies available`);
    _areCookiesEnabled = get(cookieName + '=') === uid;
  } catch (e) {
    utils.log.warn(`Error thrown when checking for cookies. Reason: "${e}"`);
  } finally {
    utils.log.info(`Cleaning up cookies availability test`);
    set(cookieName, null, opts);
  }
  return _areCookiesEnabled;
};

export default {
  set,
  get,
  getAll,
  getLastEventTime,
  sortByEventTime,
  areCookiesEnabled,
};
