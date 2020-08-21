/*
 * Persist SDK event metadata
 * Uses cookie if available, otherwise fallback to localstorage.
 */

import Base64 from './base64';
import baseCookie from './base-cookie';
import getLocation from './get-location';
import localStorage from './localstorage'; // jshint ignore:line
import topDomain from './top-domain';

/**
* MetadataStorage involves SDK data persistance
* storage priority: cookies -> localStorage -> in memory 
* if in localStorage, unable track users between subdomains
* if in memory, then memory can't be shared between different tabs
*/
 class MetadataStorage {
  constructor({storageKey, disableCookies, domain, secure, sameSite, expirationDays}) {
    this.storageKey = storageKey;
    this.disableCookieStorage = !baseCookie.areCookiesEnabled() || disableCookies;
    this.domain = domain;
    this.secure = secure;
    this.sameSite = sameSite;
    this.expirationDays = expirationDays;
    this.cookieDomain ='';

    if (!BUILD_COMPAT_REACT_NATIVE) {
      const writableTopDomain = topDomain(getLocation().href);
      this.cookieDomain = domain || (writableTopDomain ? '.' + writableTopDomain : null);
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
    const value = [
      deviceId,
      Base64.encode(userId || ''), // used to convert not unicode to alphanumeric since cookies only use alphanumeric
      optOut ? '1' : '',
      sessionId ? sessionId.toString(32) : '0', // generated when instantiated, timestamp (but re-uses session id in cookie if not expired) @TODO clients may want custom session id
      lastEventTime ? lastEventTime.toString(32) : '0', // last time an event was set
      eventId ? eventId.toString(32) : '0',
      identifyId ? identifyId.toString(32) : '0',
      sequenceNumber ? sequenceNumber.toString(32) : '0'
    ].join('.'); 

    if (this.disableCookieStorage) {
      localStorage.setItem(this.storageKey, value);
    } else {
      baseCookie.set(
        this.getCookieStorageKey(),
        value,
        {
          domain: this.cookieDomain,
          secure: this.secure,
          sameSite: this.sameSite,
          expirationDays: this.expirationDays
        }
      );
    }
  }

  load() {
    let str;
    if (!this.disableCookieStorage) {
      str = baseCookie.get(this.getCookieStorageKey() + '=');
    }
    if (!str) {
      str = localStorage.getItem(this.storageKey);
    }

    if (!str) {
      return null;
    }

    const values = str.split('.');

    let userId = null;
    if (values[1]) {
      try {
        userId = Base64.decode(values[1]);
      } catch (e) {
        userId = null;
      }
    }

    return {
      deviceId: values[0],
      userId,
      optOut: values[2] === '1',
      sessionId: parseInt(values[3], 32),
      lastEventTime: parseInt(values[4], 32),
      eventId: parseInt(values[5], 32),
      identifyId: parseInt(values[6], 32),
      sequenceNumber: parseInt(values[7], 32)
    };
  }
}

export default MetadataStorage;
