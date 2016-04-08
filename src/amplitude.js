var Constants = require('./constants');
var cookieStorage = require('./cookiestorage');
var getUtmData = require('./utm');
var Identify = require('./identify');
var localStorage = require('./localstorage');  // jshint ignore:line
var md5 = require('blueimp-md5');
var objectAssign = require('object-assign');
var Request = require('./xhr');
var type = require('./type');
var UAParser = require('ua-parser-js');
var utils = require('./utils');
var UUID = require('./uuid');
var version = require('./version');
var DEFAULT_OPTIONS = require('./options');

/**
 * Amplitude SDK API - instance constructor.
 * @constructor Amplitude
 * @public
 * @example var amplitude = new Amplitude();
 */
var Amplitude = function Amplitude() {
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new UAParser(navigator.userAgent).getResult();
  this.options = objectAssign({}, DEFAULT_OPTIONS);
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
};

Amplitude.prototype.Identify = Identify;

/**
 * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
 * This is required before any other methods can be called.
 * @public
 * @param {string} apiKey - The API key for your app.
 * @param {string} opt_userId - (optional) An identifier for this user.
 * @param {object} opt_config - (optional) Configuration options.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.
 * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
 * @example amplitude.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
 */
Amplitude.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
  if (type(apiKey) !== 'string' || utils.isEmptyString(apiKey)) {
    utils.log('Invalid apiKey. Please re-initialize with a valid apiKey');
    return;
  }

  try {
    this.options.apiKey = apiKey;
    _parseConfig(this.options, opt_config);
    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = this.cookieStorage.options().domain;

    _upgradeCookeData(this);
    _loadCookieData(this);

    // load deviceId and userId from input, or try to fetch existing value from cookie
    this.options.deviceId = (type(opt_config) === 'object' && type(opt_config.deviceId) === 'string' &&
        !utils.isEmptyString(opt_config.deviceId) && opt_config.deviceId) || this.options.deviceId || UUID() + 'R';
    this.options.userId = (type(opt_userId) === 'string' && !utils.isEmptyString(opt_userId) && opt_userId) ||
        this.options.userId || null;

    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      this._newSession = true;
      this._sessionId = now;
    }
    this._lastEventTime = now;
    _saveCookieData(this);

    if (this.options.saveEvents) {
      this._unsentEvents = this._loadSavedUnsentEvents(this.options.unsentKey);
      this._unsentIdentifys = this._loadSavedUnsentEvents(this.options.unsentIdentifyKey);

      // validate event properties for unsent events
      for (var i = 0; i < this._unsentEvents.length; i++) {
        var eventProperties = this._unsentEvents[i].event_properties;
        this._unsentEvents[i].event_properties = utils.validateProperties(eventProperties);
      }

      // validate user properties for unsent identifys
      for (var j = 0; j < this._unsentIdentifys.length; j++) {
        var userProperties = this._unsentIdentifys[j].user_properties;
        this._unsentIdentifys[j].user_properties = utils.validateProperties(userProperties);
      }

      this._sendEventsIfReady(); // try sending unsent events
    }

    if (this.options.includeUtm) {
      this._initUtmData();
    }

    if (this.options.includeReferrer) {
      this._saveReferrer(this._getReferrer());
    }
  } catch (e) {
    utils.log(e);
  } finally {
    if (type(opt_callback) === 'function') {
      opt_callback();
    }
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
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
      return;  // skip bogus config values
    }

    var inputValue = config[key];
    var expectedType = type(DEFAULT_OPTIONS[key]);
    if (!utils.validateInput(inputValue, key + ' option', expectedType)) {
      return;
    }
    if (expectedType === 'boolean') {
      options[key] = !!inputValue;
    } else if ((expectedType === 'string' && !utils.isEmptyString(inputValue)) ||
        (expectedType === 'number' && inputValue > 0)) {
      options[key] = inputValue;
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
Amplitude.prototype.runQueuedFunctions = function () {
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
Amplitude.prototype._apiKeySet = function _apiKeySet(methodName) {
  if (utils.isEmptyString(this.options.apiKey)) {
    utils.log('Invalid apiKey. Please set a valid apiKey with init() before calling ' + methodName);
    return false;
  }
  return true;
};

/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */
Amplitude.prototype._loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEventsString = this._getFromStorage(localStorage, unsentKey);
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
  utils.log('Unable to load ' + unsentKey + ' events. Restart with a new empty queue.');
  return [];
};

/**
 * Returns true if a new session was created during initialization, otherwise false.
 * @public
 * @return {boolean} Whether a new session was created during initialization.
 */
Amplitude.prototype.isNewSession = function isNewSession() {
  return this._newSession;
};

/**
 * Returns the id of the current session.
 * @public
 * @return {number} Id of the current session.
 */
Amplitude.prototype.getSessionId = function getSessionId() {
  return this._sessionId;
};

/**
 * Increments the eventId and returns it.
 * @private
 */
Amplitude.prototype.nextEventId = function nextEventId() {
  this._eventId++;
  return this._eventId;
};

/**
 * Increments the identifyId and returns it.
 * @private
 */
Amplitude.prototype.nextIdentifyId = function nextIdentifyId() {
  this._identifyId++;
  return this._identifyId;
};

/**
 * Increments the sequenceNumber and returns it.
 * @private
 */
Amplitude.prototype.nextSequenceNumber = function nextSequenceNumber() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

/**
 * Returns the total count of unsent events and identifys
 * @private
 */
Amplitude.prototype._unsentCount = function _unsentCount() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

/**
 * Send events if ready. Returns true if events are sent.
 * @private
 */
Amplitude.prototype._sendEventsIfReady = function _sendEventsIfReady(callback) {
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
Amplitude.prototype._getFromStorage = function _getFromStorage(storage, key) {
  return storage.getItem(key);
};

/**
 * Helper function to set values in storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
Amplitude.prototype._setInStorage = function _setInStorage(storage, key, value) {
  storage.setItem(key, value);
};

/**
 * cookieData (deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber)
 * can be stored in many different places (localStorage, cookie, etc).
 * Need to unify all sources into one place with a one-time upgrade/migration.
 * @private
 */
var _upgradeCookeData = function _upgradeCookeData(scope) {
  // skip if migration already happened
  var cookieData = scope.cookieStorage.get(scope.options.cookieName);
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
  var cookieData = scope.cookieStorage.get(scope.options.cookieName);
  if (type(cookieData) === 'object') {
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
  }
};

/**
 * Saves deviceId, userId, event meta data to amplitude cookie
 * @private
 */
var _saveCookieData = function _saveCookieData(scope) {
  scope.cookieStorage.set(scope.options.cookieName, {
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
Amplitude.prototype._initUtmData = function _initUtmData(queryParams, cookieParams) {
  queryParams = queryParams || location.search;
  cookieParams = cookieParams || this.cookieStorage.get('__utmz');
  var utmProperties = getUtmData(cookieParams, queryParams);
  _sendUserPropertiesOncePerSession(this, Constants.UTM_PROPERTIES, utmProperties);
};

/**
 * Since user properties are propagated on server, only send once per session, don't need to send with every event
 * @private
 */
var _sendUserPropertiesOncePerSession = function _sendUserPropertiesOncePerSession(scope, storageKey, userProperties) {
  if (type(userProperties) !== 'object' || Object.keys(userProperties).length === 0) {
    return;
  }

  // setOnce the initial user properties
  var identify = new Identify();
  for (var key in userProperties) {
    if (userProperties.hasOwnProperty(key)) {
      identify.setOnce('initial_' + key, userProperties[key]);
    }
  }

  // only save userProperties if not already in sessionStorage under key or if storage disabled
  var hasSessionStorage = utils.sessionStorageEnabled();
  if ((hasSessionStorage && !(scope._getFromStorage(sessionStorage, storageKey))) || !hasSessionStorage) {
    for (var property in userProperties) {
      if (userProperties.hasOwnProperty(property)) {
        identify.set(property, userProperties[property]);
      }
    }

    if (hasSessionStorage) {
      scope._setInStorage(sessionStorage, storageKey, JSON.stringify(userProperties));
    }
  }

  scope.identify(identify);
};

/**
 * @private
 */
Amplitude.prototype._getReferrer = function _getReferrer() {
  return document.referrer;
};

/**
 * Parse the domain from referrer info
 * @private
 */
Amplitude.prototype._getReferringDomain = function _getReferringDomain(referrer) {
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
Amplitude.prototype._saveReferrer = function _saveReferrer(referrer) {
  if (utils.isEmptyString(referrer)) {
    return;
  }
  var referrerInfo = {
    'referrer': referrer,
    'referring_domain': this._getReferringDomain(referrer)
  };
  _sendUserPropertiesOncePerSession(this, Constants.REFERRER, referrerInfo);
};

/**
 * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
 * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
 * @private
 */
Amplitude.prototype.saveEvents = function saveEvents() {
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
 * @example amplitude.setDomain('.amplitude.com');
 */
Amplitude.prototype.setDomain = function setDomain(domain) {
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
    utils.log(e);
  }
};

/**
 * Sets an identifier for the current user.
 * @public
 * @param {string} userId - identifier to set. Can be null.
 * @example amplitude.setUserId('joe@gmail.com');
 */
Amplitude.prototype.setUserId = function setUserId(userId) {
  try {
    this.options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    _saveCookieData(this);
  } catch (e) {
    utils.log(e);
  }
};

/**
 * Sets whether to opt current user out of tracking.
 * @public
 * @param {boolean} enable - if true then no events will be logged or sent.
 * @example: amplitude.setOptOut(true);
 */
Amplitude.prototype.setOptOut = function setOptOut(enable) {
  if (!utils.validateInput(enable, 'enable', 'boolean')) {
    return;
  }

  try {
    this.options.optOut = enable;
    _saveCookieData(this);
  } catch (e) {
    utils.log(e);
  }
};

/**
  * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
  * (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
  * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
  * @public
  * @param {string} deviceId - custom deviceId for current user.
  * @example amplitude.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
  */
Amplitude.prototype.setDeviceId = function setDeviceId(deviceId) {
  if (!utils.validateInput(deviceId, 'deviceId', 'string')) {
    return;
  }

  try {
    if (!utils.isEmptyString(deviceId)) {
      this.options.deviceId = ('' + deviceId);
      _saveCookieData(this);
    }
  } catch (e) {
    utils.log(e);
  }
};

/**
 * Sets user properties for the current user.
 * @public
 * @param {object} - object with string keys and values for the user properties to set.
 * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
 * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
 * @example amplitude.setUserProperties({'gender': 'female', 'sign_up_complete': true})
 */
Amplitude.prototype.setUserProperties = function setUserProperties(userProperties) {
  if (!this._apiKeySet('setUserProperties()') || !utils.validateInput(userProperties, 'userProperties', 'object')) {
    return;
  }
  // convert userProperties into an identify call
  var identify = new Identify();
  for (var property in userProperties) {
    if (userProperties.hasOwnProperty(property)) {
      identify.set(property, userProperties[property]);
    }
  }
  this.identify(identify);
};

/**
 * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
 * @public
 * @example amplitude.clearUserProperties();
 */
Amplitude.prototype.clearUserProperties = function clearUserProperties(){
  if (!this._apiKeySet('clearUserProperties()')) {
    return;
  }

  var identify = new Identify();
  identify.clearAll();
  this.identify(identify);
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
Amplitude.prototype.identify = function(identify_obj, opt_callback) {
  if (!this._apiKeySet('identify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent');
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    var instance = new Identify();
    for (var i = 0; i < identify_obj._q.length; i++) {
        var fn = instance[identify_obj._q[i][0]];
        if (type(fn) === 'function') {
          fn.apply(instance, identify_obj._q[i].slice(1));
        }
    }
    identify_obj = instance;
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(Constants.IDENTIFY_EVENT, null, null, identify_obj.userPropertiesOperations, opt_callback);
    }
  } else {
    utils.log('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));
  }

  if (type(opt_callback) === 'function') {
    opt_callback(0, 'No request sent');
  }
};

/**
 * Set a versionName for your application.
 * @public
 * @param {string} versionName
 * @example amplitude.setVersionName('1.12.3');
 */
Amplitude.prototype.setVersionName = function setVersionName(versionName) {
  if (!utils.validateInput(versionName, 'versionName', 'string')) {
    return;
  }
  this.options.versionName = versionName;
};

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 * @private
 */
Amplitude.prototype._logEvent = function _logEvent(eventType, eventProperties, apiProperties, userProperties, callback) {
  _loadCookieData(this); // reload cookie before each log event to sync event meta-data between windows and tabs
  if (!eventType || this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent');
    }
    return;
  }

  try {
    var eventId;
    if (eventType === Constants.IDENTIFY_EVENT) {
      eventId = this.nextIdentifyId();
    } else {
      eventId = this.nextEventId();
    }
    var sequenceNumber = this.nextSequenceNumber();
    var eventTime = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }
    this._lastEventTime = eventTime;
    _saveCookieData(this);

    userProperties = userProperties || {};
    apiProperties = apiProperties || {};
    eventProperties = eventProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: this._sessionId || -1,
      event_type: eventType,
      version_name: this.options.versionName || null,
      platform: this.options.platform,
      os_name: this._ua.browser.name || null,
      os_version: this._ua.browser.major || null,
      device_model: this._ua.os.name || null,
      language: this.options.language,
      api_properties: apiProperties,
      event_properties: utils.truncate(utils.validateProperties(eventProperties)),
      user_properties: utils.truncate(utils.validateProperties(userProperties)),
      uuid: UUID(),
      library: {
        name: 'amplitude-js',
        version: version
      },
      sequence_number: sequenceNumber // for ordering events and identifys
      // country: null
    };

    if (eventType === Constants.IDENTIFY_EVENT) {
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
      callback(0, 'No request sent');
    }

    return eventId;
  } catch (e) {
    utils.log(e);
  }
};

/**
 * Remove old events from the beginning of the array if too many have accumulated. Default limit is 1000 events.
 * @private
 */
Amplitude.prototype._limitEventsQueued = function _limitEventsQueued(queue) {
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
 * @example amplitude.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */
Amplitude.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
  if (!this._apiKeySet('logEvent()') || !utils.validateInput(eventType, 'eventType', 'string') ||
        utils.isEmptyString(eventType)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent');
    }
    return -1;
  }
  return this._logEvent(eventType, eventProperties, null, null, opt_callback);
};

/**
 * Test that n is a number or a numeric value.
 * @private
 */
var _isNumber = function _isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Log revenue event with a price, quantity, and product identifier.
 * @public
 * @param {number} price - price of revenue event
 * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
 * @param {string} product - (optional) product identifier
 * @example amplitude.logRevenue(3.99, 1, 'product_1234');
 */
Amplitude.prototype.logRevenue = function logRevenue(price, quantity, product) {
  // Test that the parameters are of the right type.
  if (!this._apiKeySet('logRevenue()') || !_isNumber(price) || (quantity !== undefined && !_isNumber(quantity))) {
    // utils.log('Price and quantity arguments to logRevenue must be numbers');
    return -1;
  }

  return this._logEvent('revenue_amount', {}, {
    productId: product,
    special: 'revenue_amount',
    quantity: quantity || 1,
    price: price
  });
};

/**
 * Remove events in storage with event ids up to and including maxEventId.
 * @private
 */
Amplitude.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
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
Amplitude.prototype.sendEvents = function sendEvents(callback) {
  if (!this._apiKeySet('sendEvents()') || this._sending || this.options.optOut || this._unsentCount() === 0) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent');
    }
    return;
  }

  this._sending = true;
  var url = ('https:' === window.location.protocol ? 'https' : 'http') + '://' + this.options.apiEndpoint + '/';

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
Amplitude.prototype._mergeEventsAndIdentifys = function _mergeEventsAndIdentifys(numEvents) {
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
      utils.log('Merging Events and Identifys, less events and identifys than expected');
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
Amplitude.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
  this.setUserProperties(userProperties);
};

/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */
Amplitude.prototype.__VERSION__ = version;

module.exports = Amplitude;
