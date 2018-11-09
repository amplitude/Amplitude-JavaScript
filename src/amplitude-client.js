import Constants from './constants';
import cookieStorage from './cookiestorage';
import getUtmData from './utm';
import Identify from './identify';
import localStorage from './localstorage';  // jshint ignore:line
import md5 from 'blueimp-md5';
import merge from 'lodash/merge';
import Request from './xhr';
import Revenue from './revenue';
import type from './type';
import UAParser from 'ua-parser-js';
import utils from './utils';
import UUID from './uuid';
import version from './version';
import DEFAULT_OPTIONS from './options';

/**
 * AmplitudeClient SDK API - instance constructor.
 * The Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()
 * @constructor AmplitudeClient
 * @public
 * @example var amplitudeClient = new AmplitudeClient();
 */
var AmplitudeClient = function AmplitudeClient(instanceName) {
  this._instanceName = utils.isEmptyString(instanceName) ? Constants.DEFAULT_INSTANCE : instanceName.toLowerCase();
  this._legacyStorageSuffix = this._instanceName === Constants.DEFAULT_INSTANCE ? '' : '_' + this._instanceName;
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = merge({}, DEFAULT_OPTIONS);
  this.cookieStorage = new cookieStorage().getStorage();
  this._q = []; // queue for proxied functions before script load
  this._sending = false;
  this._updateScheduled = false;

  // event meta data
  this._eventId = 0;
  this._identifyId = 0;
  this._lastEventTime = null;
  this._newSession = false;
  this._sequenceNumber = 0;
  this._sessionId = null;

  this._userAgent = (navigator && navigator.userAgent) || null;
};

AmplitudeClient.prototype.Identify = Identify;
AmplitudeClient.prototype.Revenue = Revenue;

/**
 * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
 * This is required before any other methods can be called.
 * @public
 * @param {string} apiKey - The API key for your app.
 * @param {string} opt_userId - (optional) An identifier for this user.
 * @param {object} opt_config - (optional) Configuration options.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.
 * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
 * @example amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
 */
AmplitudeClient.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
  if (type(apiKey) !== 'string' || utils.isEmptyString(apiKey)) {
    utils.log.error('Invalid apiKey. Please re-initialize with a valid apiKey');
    return;
  }

  try {
    this.options.apiKey = apiKey;
    this._storageSuffix = '_' + apiKey + this._legacyStorageSuffix;

    _parseConfig(this.options, opt_config);

    if (type(this.options.logLevel) === 'string') {
      utils.setLogLevel(this.options.logLevel);
    }

    var trackingOptions = _generateApiPropertiesTrackingConfig(this);
    this._apiPropertiesTrackingOptions = Object.keys(trackingOptions).length > 0 ? {tracking_options: trackingOptions} : {};

    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = this.cookieStorage.options().domain;

    if (this._instanceName === Constants.DEFAULT_INSTANCE) {
      _upgradeCookieData(this);
    }
    _loadCookieData(this);

    // load deviceId and userId from input, or try to fetch existing value from cookie
    this.options.deviceId = (type(opt_config) === 'object' && type(opt_config.deviceId) === 'string' &&
        !utils.isEmptyString(opt_config.deviceId) && opt_config.deviceId) ||
        (this.options.deviceIdFromUrlParam && this._getDeviceIdFromUrlParam(this._getUrlParams())) ||
        this.options.deviceId || UUID() + 'R';
    this.options.userId =
      (type(opt_userId) === 'string' && !utils.isEmptyString(opt_userId) && opt_userId) ||
      (type(opt_userId) === 'number' && opt_userId.toString()) ||
        this.options.userId || null;

    // load unsent events and identifies before any attempt to log new ones
    if (this.options.saveEvents) {
      this._unsentEvents = this._loadSavedUnsentEvents(this.options.unsentKey);
      this._unsentIdentifys = this._loadSavedUnsentEvents(this.options.unsentIdentifyKey);

      // validate event properties for unsent events
      for (var i = 0; i < this._unsentEvents.length; i++) {
        var eventProperties = this._unsentEvents[i].event_properties;
        var groups = this._unsentEvents[i].groups;
        this._unsentEvents[i].event_properties = utils.validateProperties(eventProperties);
        this._unsentEvents[i].groups = utils.validateGroups(groups);
      }

      // validate user properties for unsent identifys
      for (var j = 0; j < this._unsentIdentifys.length; j++) {
        var userProperties = this._unsentIdentifys[j].user_properties;
        var identifyGroups = this._unsentIdentifys[j].groups;
        this._unsentIdentifys[j].user_properties = utils.validateProperties(userProperties);
        this._unsentIdentifys[j].groups = utils.validateGroups(identifyGroups);
      }
    }

    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      this._newSession = true;
      this._sessionId = now;

      // only capture UTM params and referrer if new session
      if (this.options.saveParamsReferrerOncePerSession) {
        this._trackParamsAndReferrer();
      }
    }

    if (!this.options.saveParamsReferrerOncePerSession) {
      this._trackParamsAndReferrer();
    }

    this._lastEventTime = now;
    _saveCookieData(this);

    this._sendEventsIfReady(); // try sending unsent events
  } catch (e) {
    utils.log.error(e);
  } finally {
    if (type(opt_callback) === 'function') {
      opt_callback(this);
    }
  }
};

/**
 * @private
 */
AmplitudeClient.prototype._trackParamsAndReferrer = function _trackParamsAndReferrer() {
  if (this.options.includeUtm) {
    this._initUtmData();
  }
  if (this.options.includeReferrer) {
    this._saveReferrer(this._getReferrer());
  }
  if (this.options.includeGclid) {
    this._saveGclid(this._getUrlParams());
  }
};

/**
 * Parse and validate user specified config values and overwrite existing option value
 * DEFAULT_OPTIONS provides list of all config keys that are modifiable, as well as expected types for values
 * @private
 */
var _parseConfig = function _parseConfig(options, config) {
  if (type(config) !== 'object') {
    return;
  }

  // validates config value is defined, is the correct type, and some additional value sanity checks
  var parseValidateAndLoad = function parseValidateAndLoad(key) {
    if (!options.hasOwnProperty(key)) {
      return;  // skip bogus config values
    }

    var inputValue = config[key];
    var expectedType = type(options[key]);
    if (!utils.validateInput(inputValue, key + ' option', expectedType)) {
      return;
    }
    if (expectedType === 'boolean') {
      options[key] = !!inputValue;
    } else if ((expectedType === 'string' && !utils.isEmptyString(inputValue)) ||
        (expectedType === 'number' && inputValue > 0)) {
      options[key] = inputValue;
    } else if (expectedType === 'object') {
      _parseConfig(options[key], inputValue);
    }
  };

  for (var key in config) {
    if (config.hasOwnProperty(key)) {
      parseValidateAndLoad(key);
    }
  }
};

/**
 * Run functions queued up by proxy loading snippet
 * @private
 */
AmplitudeClient.prototype.runQueuedFunctions = function () {
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running
};

/**
 * Check that the apiKey is set before calling a function. Logs a warning message if not set.
 * @private
 */
AmplitudeClient.prototype._apiKeySet = function _apiKeySet(methodName) {
  if (utils.isEmptyString(this.options.apiKey)) {
    utils.log.error('Invalid apiKey. Please set a valid apiKey with init() before calling ' + methodName);
    return false;
  }
  return true;
};

/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */
AmplitudeClient.prototype._loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEventsString = this._getFromStorage(localStorage, unsentKey);
  var events = this._parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey);

  var savedUnsentEventsStringLegacy = this._getFromStorageLegacy(localStorage, unsentKey);
  var legacyEvents = this._parseSavedUnsentEventsString(savedUnsentEventsStringLegacy, unsentKey);

  var unsentEvents = legacyEvents.concat(events);

  // Migrate legacy events out of storage
  this._removeFromLegacyStorage(localStorage, unsentKey);
  this._setInStorage(localStorage, unsentKey, JSON.stringify(unsentEvents));

  return unsentEvents;
};


AmplitudeClient.prototype._removeFromLegacyStorage = function _removeFromLegacyStorage(storage, key) {
  storage.removeItem(key + this._legacyStorageSuffix);
};

/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */
AmplitudeClient.prototype._parseSavedUnsentEventsString = function _parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey) {
  if (utils.isEmptyString(savedUnsentEventsString)) {
    return []; // new app, does not have any saved events
  }

  if (type(savedUnsentEventsString) === 'string') {
    try {
      var events = JSON.parse(savedUnsentEventsString);
      if (type(events) === 'array') { // handle case where JSON dumping of unsent events is corrupted
        return events;
      }
    } catch (e) {}
  }
  utils.log.error('Unable to load ' + unsentKey + ' events. Restart with a new empty queue.');
  return [];
};

/**
 * Returns true if a new session was created during initialization, otherwise false.
 * @public
 * @return {boolean} Whether a new session was created during initialization.
 */
AmplitudeClient.prototype.isNewSession = function isNewSession() {
  return this._newSession;
};

/**
 * Returns the id of the current session.
 * @public
 * @return {number} Id of the current session.
 */
AmplitudeClient.prototype.getSessionId = function getSessionId() {
  return this._sessionId;
};

/**
 * Increments the eventId and returns it.
 * @private
 */
AmplitudeClient.prototype.nextEventId = function nextEventId() {
  this._eventId++;
  return this._eventId;
};

/**
 * Increments the identifyId and returns it.
 * @private
 */
AmplitudeClient.prototype.nextIdentifyId = function nextIdentifyId() {
  this._identifyId++;
  return this._identifyId;
};

/**
 * Increments the sequenceNumber and returns it.
 * @private
 */
AmplitudeClient.prototype.nextSequenceNumber = function nextSequenceNumber() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

/**
 * Returns the total count of unsent events and identifys
 * @private
 */
AmplitudeClient.prototype._unsentCount = function _unsentCount() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

/**
 * Send events if ready. Returns true if events are sent.
 * @private
 */
AmplitudeClient.prototype._sendEventsIfReady = function _sendEventsIfReady(callback) {
  if (this._unsentCount() === 0) {
    return false;
  }

  // if batching disabled, send any unsent events immediately
  if (!this.options.batchEvents) {
    this.sendEvents(callback);
    return true;
  }

  // if batching enabled, check if min threshold met for batch size
  if (this._unsentCount() >= this.options.eventUploadThreshold) {
    this.sendEvents(callback);
    return true;
  }

  // otherwise schedule an upload after 30s
  if (!this._updateScheduled) {  // make sure we only schedule 1 upload
    this._updateScheduled = true;
    setTimeout(function() {
        this._updateScheduled = false;
        this.sendEvents();
      }.bind(this), this.options.eventUploadPeriodMillis
    );
  }

  return false; // an upload was scheduled, no events were uploaded
};

/**
 * Helper function to fetch values from storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._getFromStorage = function _getFromStorage(storage, key) {
  return storage.getItem(key + this._storageSuffix);
};

/**
 * Helper function to fetch values from storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._getFromStorageLegacy = function _getFromStorageLegacy(storage, key) {
  return storage.getItem(key + this._legacyStorageSuffix);
};

/**
 * Helper function to set values in storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._setInStorage = function _setInStorage(storage, key, value) {
  storage.setItem(key + this._storageSuffix, value);
};

/**
 * cookieData (deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber)
 * can be stored in many different places (localStorage, cookie, etc).
 * Need to unify all sources into one place with a one-time upgrade/migration.
 * @private
 */
var _upgradeCookieData = function _upgradeCookieData(scope) {
  // skip if already migrated to 4.10+
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);
  if (type(cookieData) === 'object') {
    return;
  }
  // skip if already migrated to 2.70+
  cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);
  if (type(cookieData) === 'object' && cookieData.deviceId && cookieData.sessionId && cookieData.lastEventTime) {
    return;
  }

  var _getAndRemoveFromLocalStorage = function _getAndRemoveFromLocalStorage(key) {
    var value = localStorage.getItem(key);
    localStorage.removeItem(key);
    return value;
  };

  // in v2.6.0, deviceId, userId, optOut was migrated to localStorage with keys + first 6 char of apiKey
  var apiKeySuffix = (type(scope.options.apiKey) === 'string' && ('_' + scope.options.apiKey.slice(0, 6))) || '';
  var localStorageDeviceId = _getAndRemoveFromLocalStorage(Constants.DEVICE_ID + apiKeySuffix);
  var localStorageUserId = _getAndRemoveFromLocalStorage(Constants.USER_ID + apiKeySuffix);
  var localStorageOptOut = _getAndRemoveFromLocalStorage(Constants.OPT_OUT + apiKeySuffix);
  if (localStorageOptOut !== null && localStorageOptOut !== undefined) {
    localStorageOptOut = String(localStorageOptOut) === 'true'; // convert to boolean
  }

  // pre-v2.7.0 event and session meta-data was stored in localStorage. move to cookie for sub-domain support
  var localStorageSessionId = parseInt(_getAndRemoveFromLocalStorage(Constants.SESSION_ID));
  var localStorageLastEventTime = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_EVENT_TIME));
  var localStorageEventId = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_EVENT_ID));
  var localStorageIdentifyId = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_IDENTIFY_ID));
  var localStorageSequenceNumber = parseInt(_getAndRemoveFromLocalStorage(Constants.LAST_SEQUENCE_NUMBER));

  var _getFromCookie = function _getFromCookie(key) {
    return type(cookieData) === 'object' && cookieData[key];
  };
  scope.options.deviceId = _getFromCookie('deviceId') || localStorageDeviceId;
  scope.options.userId = _getFromCookie('userId') || localStorageUserId;
  scope._sessionId = _getFromCookie('sessionId') || localStorageSessionId || scope._sessionId;
  scope._lastEventTime = _getFromCookie('lastEventTime') || localStorageLastEventTime || scope._lastEventTime;
  scope._eventId = _getFromCookie('eventId') || localStorageEventId || scope._eventId;
  scope._identifyId = _getFromCookie('identifyId') || localStorageIdentifyId || scope._identifyId;
  scope._sequenceNumber = _getFromCookie('sequenceNumber') || localStorageSequenceNumber || scope._sequenceNumber;

  // optOut is a little trickier since it is a boolean
  scope.options.optOut = localStorageOptOut || false;
  if (cookieData && cookieData.optOut !== undefined && cookieData.optOut !== null) {
    scope.options.optOut = String(cookieData.optOut) === 'true';
  }

  _saveCookieData(scope);
};

/**
 * Fetches deviceId, userId, event meta data from amplitude cookie
 * @private
 */
var _loadCookieData = function _loadCookieData(scope) {
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);

  if (type(cookieData) === 'object') {
    _loadCookieDataProps(scope, cookieData);
  } else {
    var legacyCookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);
    if (type(legacyCookieData) === 'object') {
      scope.cookieStorage.remove(scope.options.cookieName + scope._legacyStorageSuffix);
      _loadCookieDataProps(scope, legacyCookieData);
    }
  }
};

var _loadCookieDataProps = function _loadCookieDataProps(scope, cookieData) {
  if (cookieData.deviceId) {
    scope.options.deviceId = cookieData.deviceId;
  }
  if (cookieData.userId) {
    scope.options.userId = cookieData.userId;
  }
  if (cookieData.optOut !== null && cookieData.optOut !== undefined) {
    scope.options.optOut = cookieData.optOut;
  }
  if (cookieData.sessionId) {
    scope._sessionId = parseInt(cookieData.sessionId);
  }
  if (cookieData.lastEventTime) {
    scope._lastEventTime = parseInt(cookieData.lastEventTime);
  }
  if (cookieData.eventId) {
    scope._eventId = parseInt(cookieData.eventId);
  }
  if (cookieData.identifyId) {
    scope._identifyId = parseInt(cookieData.identifyId);
  }
  if (cookieData.sequenceNumber) {
    scope._sequenceNumber = parseInt(cookieData.sequenceNumber);
  }
};

/**
 * Saves deviceId, userId, event meta data to amplitude cookie
 * @private
 */
var _saveCookieData = function _saveCookieData(scope) {
  scope.cookieStorage.set(scope.options.cookieName + scope._storageSuffix, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    optOut: scope.options.optOut,
    sessionId: scope._sessionId,
    lastEventTime: scope._lastEventTime,
    eventId: scope._eventId,
    identifyId: scope._identifyId,
    sequenceNumber: scope._sequenceNumber
  });
};

/**
 * Parse the utm properties out of cookies and query for adding to user properties.
 * @private
 */
AmplitudeClient.prototype._initUtmData = function _initUtmData(queryParams, cookieParams) {
  queryParams = queryParams || this._getUrlParams();
  cookieParams = cookieParams || this.cookieStorage.get('__utmz');
  var utmProperties = getUtmData(cookieParams, queryParams);
  _sendParamsReferrerUserProperties(this, utmProperties);
};

/**
 * The calling function should determine when it is appropriate to send these user properties. This function
 * will no longer contain any session storage checking logic.
 * @private
 */
var _sendParamsReferrerUserProperties = function _sendParamsReferrerUserProperties(scope, userProperties) {
  if (type(userProperties) !== 'object' || Object.keys(userProperties).length === 0) {
    return;
  }

  // setOnce the initial user properties
  var identify = new Identify();
  for (var key in userProperties) {
    if (userProperties.hasOwnProperty(key)) {
      identify.setOnce('initial_' + key, userProperties[key]);
      identify.set(key, userProperties[key]);
    }
  }

  scope.identify(identify);
};

/**
 * @private
 */
AmplitudeClient.prototype._getReferrer = function _getReferrer() {
  return document.referrer;
};

/**
 * @private
 */
AmplitudeClient.prototype._getUrlParams = function _getUrlParams() {
  return location.search;
};

/**
 * Try to fetch Google Gclid from url params.
 * @private
 */
AmplitudeClient.prototype._saveGclid = function _saveGclid(urlParams) {
  var gclid = utils.getQueryParam('gclid', urlParams);
  if (utils.isEmptyString(gclid)) {
    return;
  }
  var gclidProperties = {'gclid': gclid};
  _sendParamsReferrerUserProperties(this, gclidProperties);
};

/**
 * Try to fetch Amplitude device id from url params.
 * @private
 */
AmplitudeClient.prototype._getDeviceIdFromUrlParam = function _getDeviceIdFromUrlParam(urlParams) {
  return utils.getQueryParam(Constants.AMP_DEVICE_ID_PARAM, urlParams);
};

/**
 * Parse the domain from referrer info
 * @private
 */
AmplitudeClient.prototype._getReferringDomain = function _getReferringDomain(referrer) {
  if (utils.isEmptyString(referrer)) {
    return null;
  }
  var parts = referrer.split('/');
  if (parts.length >= 3) {
    return parts[2];
  }
  return null;
};

/**
 * Fetch the referrer information, parse the domain and send.
 * Since user properties are propagated on the server, only send once per session, don't need to send with every event
 * @private
 */
AmplitudeClient.prototype._saveReferrer = function _saveReferrer(referrer) {
  if (utils.isEmptyString(referrer)) {
    return;
  }
  var referrerInfo = {
    'referrer': referrer,
    'referring_domain': this._getReferringDomain(referrer)
  };
  _sendParamsReferrerUserProperties(this, referrerInfo);
};

/**
 * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
 * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
 * @private
 */
AmplitudeClient.prototype.saveEvents = function saveEvents() {
  try {
    this._setInStorage(localStorage, this.options.unsentKey, JSON.stringify(this._unsentEvents));
  } catch (e) {}

  try {
    this._setInStorage(localStorage, this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
  } catch (e) {}
};

/**
 * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
 * @public
 * @param {string} domain to set.
 * @example amplitudeClient.setDomain('.amplitude.com');
 */
AmplitudeClient.prototype.setDomain = function setDomain(domain) {
  if (!utils.validateInput(domain, 'domain', 'string')) {
    return;
  }

  try {
    this.cookieStorage.options({
      domain: domain
    });
    this.options.domain = this.cookieStorage.options().domain;
    _loadCookieData(this);
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Sets an identifier for the current user.
 * @public
 * @param {string} userId - identifier to set. Can be null.
 * @example amplitudeClient.setUserId('joe@gmail.com');
 */
AmplitudeClient.prototype.setUserId = function setUserId(userId) {
  try {
    this.options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Add user to a group or groups. You need to specify a groupType and groupName(s).
 * For example you can group people by their organization.
 * In that case groupType is "orgId" and groupName would be the actual ID(s).
 * groupName can be a string or an array of strings to indicate a user in multiple gruups.
 * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
 * Note: this will also set groupType: groupName as a user property.
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information.
 * @public
 * @param {string} groupType - the group type (ex: orgId)
 * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
 * @example amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.
 */
AmplitudeClient.prototype.setGroup = function(groupType, groupName) {
  if (!this._apiKeySet('setGroup()') || !utils.validateInput(groupType, 'groupType', 'string') ||
        utils.isEmptyString(groupType)) {
    return;
  }

  var groups = {};
  groups[groupType] = groupName;
  var identify = new Identify().set(groupType, groupName);
  this._logEvent(Constants.IDENTIFY_EVENT, null, null, identify.userPropertiesOperations, groups, null, null, null);
};

/**
 * Sets whether to opt current user out of tracking.
 * @public
 * @param {boolean} enable - if true then no events will be logged or sent.
 * @example: amplitude.setOptOut(true);
 */
AmplitudeClient.prototype.setOptOut = function setOptOut(enable) {
  if (!utils.validateInput(enable, 'enable', 'boolean')) {
    return;
  }

  try {
    this.options.optOut = enable;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.setSessionId = function setSessionId(sessionId) {
  if (!utils.validateInput(sessionId, 'sessionId', 'number')) {
    return;
  }

  try {
    this._sessionId = sessionId;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.resetSessionId = function resetSessionId() {
  this.setSessionId(new Date().getTime());
};

/**
  * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
  * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
  * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
  * This uses src/uuid.js to regenerate the deviceId.
  * @public
  */
AmplitudeClient.prototype.regenerateDeviceId = function regenerateDeviceId() {
  this.setDeviceId(UUID() + 'R');
};

/**
  * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
  * (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
  * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
  * @public
  * @param {string} deviceId - custom deviceId for current user.
  * @example amplitudeClient.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
  */
AmplitudeClient.prototype.setDeviceId = function setDeviceId(deviceId) {
  if (!utils.validateInput(deviceId, 'deviceId', 'string')) {
    return;
  }

  try {
    if (!utils.isEmptyString(deviceId)) {
      this.options.deviceId = ('' + deviceId);
      _saveCookieData(this);
    }
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Sets user properties for the current user.
 * @public
 * @param {object} - object with string keys and values for the user properties to set.
 * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
 * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
 * @example amplitudeClient.setUserProperties({'gender': 'female', 'sign_up_complete': true})
 */
AmplitudeClient.prototype.setUserProperties = function setUserProperties(userProperties) {
  if (!this._apiKeySet('setUserProperties()') || !utils.validateInput(userProperties, 'userProperties', 'object')) {
    return;
  }
  // sanitize the userProperties dict before converting into identify
  var sanitized = utils.truncate(utils.validateProperties(userProperties));
  if (Object.keys(sanitized).length === 0) {
    return;
  }

  // convert userProperties into an identify call
  var identify = new Identify();
  for (var property in sanitized) {
    if (sanitized.hasOwnProperty(property)) {
      identify.set(property, sanitized[property]);
    }
  }
  this.identify(identify);
};

/**
 * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
 * @public
 * @example amplitudeClient.clearUserProperties();
 */
AmplitudeClient.prototype.clearUserProperties = function clearUserProperties(){
  if (!this._apiKeySet('clearUserProperties()')) {
    return;
  }

  var identify = new Identify();
  identify.clearAll();
  this.identify(identify);
};

/**
 * Applies the proxied functions on the proxied object to an instance of the real object.
 * Used to convert proxied Identify and Revenue objects.
 * @private
 */
var _convertProxyObjectToRealObject = function _convertProxyObjectToRealObject(instance, proxy) {
  for (var i = 0; i < proxy._q.length; i++) {
    var fn = instance[proxy._q[i][0]];
    if (type(fn) === 'function') {
      fn.apply(instance, proxy._q[i].slice(1));
    }
  }
  return instance;
};

/**
 * Send an identify call containing user property operations to Amplitude servers.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
 * for more information on the Identify API and user property operations.
 * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
 * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
 * Note: the server response code and response body from the identify event upload are passed to the callback function.
 * @example
 * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
 * amplitude.identify(identify);
 */
AmplitudeClient.prototype.identify = function(identify_obj, opt_callback) {
  if (!this._apiKeySet('identify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'API key is not set'});
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(
        Constants.IDENTIFY_EVENT, null, null, identify_obj.userPropertiesOperations, null, null, null, opt_callback
        );
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', {reason: 'No user property operations'});
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid identify input type'});
    }
  }
};

AmplitudeClient.prototype.groupIdentify = function(group_type, group_name, identify_obj, opt_callback) {
  if (!this._apiKeySet('groupIdentify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'API key is not set'});
    }
    return;
  }

  if (!utils.validateInput(group_type, 'group_type', 'string') ||
        utils.isEmptyString(group_type)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid group type'});
    }
    return;
  }

  if (group_name === null || group_name === undefined) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid group name'});
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(
        Constants.GROUP_IDENTIFY_EVENT, null, null, null, {[group_type]: group_name}, identify_obj.userPropertiesOperations, null, opt_callback
        );
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', {reason: 'No group property operations'});
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid identify input type'});
    }
  }
};

/**
 * Set a versionName for your application.
 * @public
 * @param {string} versionName - The version to set for your application.
 * @example amplitudeClient.setVersionName('1.12.3');
 */
AmplitudeClient.prototype.setVersionName = function setVersionName(versionName) {
  if (!utils.validateInput(versionName, 'versionName', 'string')) {
    return;
  }
  this.options.versionName = versionName;
};

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 * @private
 */
AmplitudeClient.prototype._logEvent = function _logEvent(eventType, eventProperties, apiProperties, userProperties, groups, groupProperties, timestamp, callback) {
  _loadCookieData(this); // reload cookie before each log event to sync event meta-data between windows and tabs
  if (!eventType) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'Missing eventType'});
    }
    return;
  }
  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'optOut is set to true'});
    }
    return;
  }

  try {
    var eventId;
    if (eventType === Constants.IDENTIFY_EVENT || eventType === Constants.GROUP_IDENTIFY_EVENT) {
      eventId = this.nextIdentifyId();
    } else {
      eventId = this.nextEventId();
    }
    var sequenceNumber = this.nextSequenceNumber();
    var eventTime = (type(timestamp) === 'number') ? timestamp : new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }
    this._lastEventTime = eventTime;
    _saveCookieData(this);

    userProperties = userProperties || {};
    var trackingOptions = merge({}, this._apiPropertiesTrackingOptions);
    apiProperties = merge(trackingOptions, (apiProperties || {}));
    eventProperties = eventProperties || {};
    groups = groups || {};
    groupProperties = groupProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: this._sessionId || -1,
      event_type: eventType,
      version_name: _shouldTrackField(this, 'version_name') ? (this.options.versionName || null) : null,
      platform: _shouldTrackField(this, 'platform') ? this.options.platform : null,
      os_name: _shouldTrackField(this, 'os_name') ? (this._ua.browser.name || null) : null,
      os_version: _shouldTrackField(this, 'os_version') ? (this._ua.browser.major || null) : null,
      device_model: _shouldTrackField(this, 'device_model') ? (this._ua.os.name || null) : null,
      language: _shouldTrackField(this, 'language') ? this.options.language : null,
      api_properties: apiProperties,
      event_properties: utils.truncate(utils.validateProperties(eventProperties)),
      user_properties: utils.truncate(utils.validateProperties(userProperties)),
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: version
      },
      sequence_number: sequenceNumber, // for ordering events and identifys
      groups: utils.truncate(utils.validateGroups(groups)),
      group_properties: utils.truncate(utils.validateProperties(groupProperties)), 
      user_agent: this._userAgent
    };

    if (eventType === Constants.IDENTIFY_EVENT || eventType === Constants.GROUP_IDENTIFY_EVENT) {
      this._unsentIdentifys.push(event);
      this._limitEventsQueued(this._unsentIdentifys);
    } else {
      this._unsentEvents.push(event);
      this._limitEventsQueued(this._unsentEvents);
    }

    if (this.options.saveEvents) {
      this.saveEvents();
    }

    if (!this._sendEventsIfReady(callback) && type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'No events to send or upload queued'});
    }

    return eventId;
  } catch (e) {
    utils.log.error(e);
  }
};

var _shouldTrackField = function _shouldTrackField(scope, field) {
  return !!scope.options.trackingOptions[field];
};

var _generateApiPropertiesTrackingConfig = function _generateApiPropertiesTrackingConfig(scope) {
  // to limit size of config payload, only send fields that have been disabled
  var fields = ['city', 'country', 'dma', 'ip_address', 'region'];
  var config = {};
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!_shouldTrackField(scope, field)) {
      config[field] = false;
    }
  }
  return config;
};

/**
 * Remove old events from the beginning of the array if too many have accumulated. Default limit is 1000 events.
 * @private
 */
AmplitudeClient.prototype._limitEventsQueued = function _limitEventsQueued(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};

/**
 * This is the callback for logEvent and identify calls. It gets called after the event/identify is uploaded,
 * and the server response code and response body from the upload request are passed to the callback function.
 * @callback Amplitude~eventCallback
 * @param {number} responseCode - Server response code for the event / identify upload request.
 * @param {string} responseBody - Server response body for the event / identify upload request.
 */

/**
 * Log an event with eventType and eventProperties
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */
AmplitudeClient.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
  return this.logEventWithTimestamp(eventType, eventProperties, null, opt_callback);
};

/**
 * Log an event with eventType and eventProperties and a custom timestamp
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {number} timesatmp - (optional) the custom timestamp as milliseconds since epoch.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */
AmplitudeClient.prototype.logEventWithTimestamp = function logEvent(eventType, eventProperties, timestamp, opt_callback) {
  if (!this._apiKeySet('logEvent()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'API key not set'});
    }
    return -1;
  }
  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid type for eventType'});
    }
    return -1;
  }
  if (utils.isEmptyString(eventType)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Missing eventType'});
    }
    return -1;
  }
  return this._logEvent(eventType, eventProperties, null, null, null, null, timestamp, opt_callback);
};

/**
 * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
 * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
 * (unless you explicitly set it with setGroup).
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information
 * about groups and Count by Distinct on the Amplitude platform.
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
 * groupName can be a string or an array of strings.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEventWithGroups('Clicked Button', null, {'orgId': 24});
 */
AmplitudeClient.prototype.logEventWithGroups = function(eventType, eventProperties, groups, opt_callback) {
  if (!this._apiKeySet('logEventWithGroups()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'API key not set'});
    }
    return -1;
  }
  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', {reason: 'Invalid type for eventType'});
    }
    return -1;
  }
  return this._logEvent(eventType, eventProperties, null, null, groups, null, null, opt_callback);
};

/**
 * Test that n is a number or a numeric value.
 * @private
 */
var _isNumber = function _isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
 * revenueType and event properties.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue}
 * for more information on the Revenue interface and logging revenue.
 * @public
 * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
AmplitudeClient.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
  if (!this._apiKeySet('logRevenueV2()')) {
    return;
  }

  // if revenue input is a proxied object created by the async loading snippet, convert it into an revenue object
  if (type(revenue_obj) === 'object' && revenue_obj.hasOwnProperty('_q')) {
    revenue_obj = _convertProxyObjectToRealObject(new Revenue(), revenue_obj);
  }

  if (revenue_obj instanceof Revenue) {
    // only send if revenue is valid
    if (revenue_obj && revenue_obj._isValidRevenue()) {
      return this.logEvent(Constants.REVENUE_EVENT, revenue_obj._toJSONObject());
    }
  } else {
    utils.log.error('Invalid revenue input type. Expected Revenue object but saw ' + type(revenue_obj));
  }
};

/**
 * Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2
 * @public
 * @deprecated
 * @param {number} price - price of revenue event
 * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
 * @param {string} product - (optional) product identifier
 * @example amplitudeClient.logRevenue(3.99, 1, 'product_1234');
 */
AmplitudeClient.prototype.logRevenue = function logRevenue(price, quantity, product) {
  // Test that the parameters are of the right type.
  if (!this._apiKeySet('logRevenue()') || !_isNumber(price) || (quantity !== undefined && !_isNumber(quantity))) {
    // utils.log('Price and quantity arguments to logRevenue must be numbers');
    return -1;
  }

  return this._logEvent(Constants.REVENUE_EVENT, {}, {
    productId: product,
    special: 'revenue_amount',
    quantity: quantity || 1,
    price: price
  }, null, null, null, null, null);
};

/**
 * Remove events in storage with event ids up to and including maxEventId.
 * @private
 */
AmplitudeClient.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
  _removeEvents(this, '_unsentEvents', maxEventId);
  _removeEvents(this, '_unsentIdentifys', maxIdentifyId);
};

/**
 * Helper function to remove events up to maxId from a single queue.
 * Does a true filter in case events get out of order or old events are removed.
 * @private
 */
var _removeEvents = function _removeEvents(scope, eventQueue, maxId) {
  if (maxId < 0) {
    return;
  }

  var filteredEvents = [];
  for (var i = 0; i < scope[eventQueue].length || 0; i++) {
    if (scope[eventQueue][i].event_id > maxId) {
      filteredEvents.push(scope[eventQueue][i]);
    }
  }
  scope[eventQueue] = filteredEvents;
};

/**
 * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
 * If batchEvents is true, then events are only sent when batch criterias are met.
 * @private
 * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
 * Note the server response code and response body are passed to the callback as input arguments.
 */
AmplitudeClient.prototype.sendEvents = function sendEvents(callback) {
  if (!this._apiKeySet('sendEvents()')) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'API key not set'});
    }
    return;
  }
  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'optOut is set to true'});
    }
    return;
  }
  if (this._unsentCount() === 0) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'No events to send'});
    }
    return;
  }
  if (this._sending) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', {reason: 'Request already in progress'});
    }
    return;
  }

  this._sending = true;
  var protocol = this.options.forceHttps ? 'https' : ('https:' === window.location.protocol ? 'https' : 'http');
  var url = protocol + '://' + this.options.apiEndpoint + '/';

  // fetch events to send
  var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);
  var mergedEvents = this._mergeEventsAndIdentifys(numEvents);
  var maxEventId = mergedEvents.maxEventId;
  var maxIdentifyId = mergedEvents.maxIdentifyId;
  var events = JSON.stringify(mergedEvents.eventsToSend);
  var uploadTime = new Date().getTime();

  var data = {
    client: this.options.apiKey,
    e: events,
    v: Constants.API_VERSION,
    upload_time: uploadTime,
    checksum: md5(Constants.API_VERSION + this.options.apiKey + events + uploadTime)
  };

  var scope = this;
  new Request(url, data).send(function(status, response) {
    scope._sending = false;
    try {
      if (status === 200 && response === 'success') {
        scope.removeEvents(maxEventId, maxIdentifyId);

        // Update the event cache after the removal of sent events.
        if (scope.options.saveEvents) {
          scope.saveEvents();
        }

        // Send more events if any queued during previous send.
        if (!scope._sendEventsIfReady(callback) && type(callback) === 'function') {
          callback(status, response);
        }

      // handle payload too large
      } else if (status === 413) {
        // utils.log('request too large');
        // Can't even get this one massive event through. Drop it, even if it is an identify.
        if (scope.options.uploadBatchSize === 1) {
          scope.removeEvents(maxEventId, maxIdentifyId);
        }

        // The server complained about the length of the request. Backoff and try again.
        scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
        scope.sendEvents(callback);

      } else if (type(callback) === 'function') { // If server turns something like a 400
        callback(status, response);
      }
    } catch (e) {
      // utils.log('failed upload');
    }
  });
};

/**
 * Merge unsent events and identifys together in sequential order based on their sequence number, for uploading.
 * @private
 */
AmplitudeClient.prototype._mergeEventsAndIdentifys = function _mergeEventsAndIdentifys(numEvents) {
  // coalesce events from both queues
  var eventsToSend = [];
  var eventIndex = 0;
  var maxEventId = -1;
  var identifyIndex = 0;
  var maxIdentifyId = -1;

  while (eventsToSend.length < numEvents) {
    var event;
    var noIdentifys = identifyIndex >= this._unsentIdentifys.length;
    var noEvents = eventIndex >= this._unsentEvents.length;

    // case 0: no events or identifys left
    // note this should not happen, this means we have less events and identifys than expected
    if (noEvents && noIdentifys) {
      utils.log.error('Merging Events and Identifys, less events and identifys than expected');
      break;
    }

    // case 1: no identifys - grab from events
    else if (noIdentifys) {
      event = this._unsentEvents[eventIndex++];
      maxEventId = event.event_id;

    // case 2: no events - grab from identifys
    } else if (noEvents) {
      event = this._unsentIdentifys[identifyIndex++];
      maxIdentifyId = event.event_id;

    // case 3: need to compare sequence numbers
    } else {
      // events logged before v2.5.0 won't have a sequence number, put those first
      if (!('sequence_number' in this._unsentEvents[eventIndex]) ||
          this._unsentEvents[eventIndex].sequence_number <
          this._unsentIdentifys[identifyIndex].sequence_number) {
        event = this._unsentEvents[eventIndex++];
        maxEventId = event.event_id;
      } else {
        event = this._unsentIdentifys[identifyIndex++];
        maxIdentifyId = event.event_id;
      }
    }

    eventsToSend.push(event);
  }

  return {
    eventsToSend: eventsToSend,
    maxEventId: maxEventId,
    maxIdentifyId: maxIdentifyId
  };
};

/**
 * Set global user properties. Note this is deprecated, and we recommend using setUserProperties
 * @public
 * @deprecated
 */
AmplitudeClient.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
  this.setUserProperties(userProperties);
};

/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */
AmplitudeClient.prototype.__VERSION__ = version;

export default AmplitudeClient;
