/*
 * Persist SDK event metadata
 * Uses cookie if available, otherwise fallback to localstorage.
 */

import Base64 from './base64';
import baseCookie from './base-cookie';
import Constants from './constants';
import ampLocalStorage from './localstorage';
import topDomain from './top-domain';
import utils from './utils';
import GlobalScope from './global-scope';

const storageOptionExists = {
  [Constants.STORAGE_COOKIES]: true,
  [Constants.STORAGE_NONE]: true,
  [Constants.STORAGE_LOCAL]: true,
  [Constants.STORAGE_SESSION]: true,
};

/**
 * MetadataStorage involves SDK data persistance
 * storage priority: cookies -> localStorage -> in memory
 * This priority can be overriden by setting the storage options.
 * if in localStorage, unable track users between subdomains
 * if in memory, then memory can't be shared between different tabs
 */
class MetadataStorage {
  constructor({ storageKey, disableCookies, domain, secure, sameSite, expirationDays, storage }) {
    this.storageKey = storageKey;
    this.domain = domain;
    this.secure = secure;
    this.sameSite = sameSite;
    this.expirationDays = expirationDays;

    this.cookieDomain = '';
    const loc = utils.getLocation() ? utils.getLocation().href : undefined;
    const writableTopDomain = !disableCookies ? topDomain(loc) : '';
    this.cookieDomain = domain || (writableTopDomain ? '.' + writableTopDomain : null);

    if (storageOptionExists[storage]) {
      this.storage = storage;
    } else {
      const disableCookieStorage =
        disableCookies ||
        !baseCookie.areCookiesEnabled({
          domain: this.cookieDomain,
          secure: this.secure,
          sameSite: this.sameSite,
          expirationDays: this.expirationDays,
        });
      if (disableCookieStorage) {
        this.storage = Constants.STORAGE_LOCAL;
      } else {
        this.storage = Constants.STORAGE_COOKIES;
      }
    }
  }

  getCookieStorageKey() {
    if (!this.domain) {
      return this.storageKey;
    }

    const suffix = this.domain.charAt(0) === '.' ? this.domain.substring(1) : this.domain;

    return `${this.storageKey}${suffix ? `_${suffix}` : ''}`;
  }

  /*
   * Data is saved as delimited values rather than JSO to minimize cookie space
   * Should not change order of the items
   */
  save({ deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber }) {
    if (this.storage === Constants.STORAGE_NONE) {
      return;
    }
    const value = [
      deviceId,
      Base64.encode(userId || ''), // used to convert not unicode to alphanumeric since cookies only use alphanumeric
      optOut ? '1' : '',
      sessionId ? sessionId.toString(32) : '0', // generated when instantiated, timestamp (but re-uses session id in cookie if not expired) @TODO clients may want custom session id
      lastEventTime ? lastEventTime.toString(32) : '0', // last time an event was set
      eventId ? eventId.toString(32) : '0',
      identifyId ? identifyId.toString(32) : '0',
      sequenceNumber ? sequenceNumber.toString(32) : '0',
    ].join('.');

    switch (this.storage) {
      case Constants.STORAGE_SESSION:
        if (GlobalScope.sessionStorage) {
          GlobalScope.sessionStorage.setItem(this.storageKey, value);
        }
        break;
      case Constants.STORAGE_LOCAL:
        ampLocalStorage.setItem(this.storageKey, value);
        break;
      case Constants.STORAGE_COOKIES:
        this.saveCookie(value);
        break;
    }
  }

  saveCookie(value) {
    baseCookie.set(this.getCookieStorageKey(), value, {
      domain: this.cookieDomain,
      secure: this.secure,
      sameSite: this.sameSite,
      expirationDays: this.expirationDays,
    });
  }

  load() {
    let str;
    if (this.storage === Constants.STORAGE_COOKIES) {
      const cookieKey = this.getCookieStorageKey() + '=';
      const allCookies = baseCookie.getAll(cookieKey);
      if (allCookies.length === 0 || allCookies.length === 1) {
        str = allCookies[0];
      } else {
        // dedup cookies by deleting them all and restoring
        // the one with the most recent event time
        const latestCookie = baseCookie.sortByEventTime(allCookies)[0];
        allCookies.forEach(() => baseCookie.set(this.getCookieStorageKey(), null, {}));
        this.saveCookie(latestCookie);
        str = baseCookie.get(cookieKey);
      }
    }
    if (!str) {
      str = ampLocalStorage.getItem(this.storageKey);
    }
    if (!str) {
      try {
        str = GlobalScope.sessionStorage && GlobalScope.sessionStorage.getItem(this.storageKey);
      } catch (e) {
        utils.log.info(`window.sessionStorage unavailable. Reason: "${e}"`);
      }
    }

    if (!str) {
      return null;
    }

    const values = str.split('.');

    let userId = null;
    if (values[Constants.USER_ID_INDEX]) {
      try {
        userId = Base64.decode(values[Constants.USER_ID_INDEX]);
      } catch (e) {
        userId = null;
      }
    }

    return {
      deviceId: values[Constants.DEVICE_ID_INDEX],
      userId,
      optOut: values[Constants.OPT_OUT_INDEX] === '1',
      sessionId: parseInt(values[Constants.SESSION_ID_INDEX], 32),
      lastEventTime: parseInt(values[Constants.LAST_EVENT_TIME_INDEX], 32),
      eventId: parseInt(values[Constants.EVENT_ID_INDEX], 32),
      identifyId: parseInt(values[Constants.IDENTIFY_ID_INDEX], 32),
      sequenceNumber: parseInt(values[Constants.SEQUENCE_NUMBER_INDEX], 32),
    };
  }

  /**
   * Clears any saved metadata storage
   * @constructor AmplitudeClient
   * @public
   * @return {boolean} True if metadata was cleared, false if none existed
   */
  clear() {
    let str;
    if (this.storage === Constants.STORAGE_COOKIES) {
      str = baseCookie.get(this.getCookieStorageKey() + '=');
      baseCookie.set(this.getCookieStorageKey(), null, {
        domain: this.cookieDomain,
        secure: this.secure,
        sameSite: this.sameSite,
        expirationDays: 0,
      });
    }
    if (!str) {
      str = ampLocalStorage.getItem(this.storageKey);
      ampLocalStorage.clear();
    }
    if (!str) {
      try {
        str = GlobalScope.sessionStorage && GlobalScope.sessionStorage.getItem(this.storageKey);
        GlobalScope.sessionStorage.clear();
      } catch (e) {
        utils.log.info(`window.sessionStorage unavailable. Reason: "${e}"`);
      }
    }
    return !!str;
  }
}

export default MetadataStorage;
