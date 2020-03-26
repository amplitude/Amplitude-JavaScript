/*
 * Persist SDK event metadata
 * Uses cookie if available, otherwise fallback to localstorage.
 */

import Base64 from './base64';
import Cookie from './cookie';
import baseCookie from './base-cookie';
import localStorage from './localstorage'; // jshint ignore:line

class MetadataStorage {
  constructor({storageKey, disableCookies, domain, secure, sameSite, expirationDays}) {
    this.storageKey = storageKey;
    this.disableCookieStorage = !Cookie.areCookiesEnabled() || disableCookies;
    this.domain = domain;
    this.secure = secure;
    this.sameSite = sameSite;
    this.expirationDays = expirationDays;
    this.topDomain = domain || Cookie.topDomain();
  }

  getCookieStorageKey() {
    return `${this.storageKey}${this.domain ? `_${this.domain}` : ''}`;
  }

  save({ deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber }) {
    // do not change the order of these items
    const value = `${deviceId}.${Base64.encode(userId || '')}.${optOut ? '1' : ''}.${sessionId}.${lastEventTime}.${eventId}.${identifyId}.${sequenceNumber}`;

    if (this.disableCookieStorage) {
      localStorage.setItem(this.storageKey, value);
    } else {
      baseCookie.set(
        this.getCookieStorageKey(),
        value,
        { domain: this.topDomain, secure: this.secure, sameSite: this.sameSite, expirationDays: this.expirationDays }
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
      sessionId: parseInt(values[3], 10),
      lastEventTime: parseInt(values[4], 10),
      eventId: parseInt(values[5], 10),
      identifyId: parseInt(values[6], 10),
      sequenceNumber: parseInt(values[7], 10)
    };
  }
}

export default MetadataStorage;
