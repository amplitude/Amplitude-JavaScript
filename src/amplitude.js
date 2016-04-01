var Constants = require('./constants');
var cookieStorage = require('./cookiestorage');
var getUtmData = require('./utm');
var Identify = require('./identify');
var JSON = require('json'); // jshint ignore:line
var localStorage = require('./localstorage');  // jshint ignore:line
var md5 = require('JavaScript-MD5');
var object = require('object');
var Request = require('./xhr');
var type = require('./type');
var UAParser = require('ua-parser-js');
var utils = require('./utils');
var UUID = require('./uuid');
var version = require('./version');
var DEFAULT_OPTIONS = require('./options');

/**
 * Amplitude API - instance constructor
 */
var Amplitude = function Amplitude() {
  this.options = object.merge({}, DEFAULT_OPTIONS);

  this._cookieStorage = new cookieStorage().getStorage();
  this._q = []; // queue for proxied functions before script load
  this._sending = false;
  this._ua = new UAParser(navigator.userAgent).getResult();
  this._unsentEvents = [];
  this._unsentIdentifys = [];
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

Amplitude.prototype._runQueuedFunctions = function () {
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running
};

/**
 * Initializes Amplitude
 * @param {string} apiKey - The API key for your app
 * @param {string} opt_userId - (optional) An identifier for this user
 * @param {Object} opt_config - (optional) Configuration options
 *   - saveEvents (boolean) Whether to save events to local storage. Defaults to true.
 *   - includeUtm (boolean) Whether to send utm parameters with events. Defaults to false.
 *   - includeReferrer (boolean) Whether to send referrer info with events. Defaults to false.
 *   - See https://github.com/amplitude/Amplitude-Javascript#configuration-options for complete list.
 * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
 */
Amplitude.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
  try {
    this.options.apiKey = (type(apiKey) === 'string' && !utils.isEmptyString(apiKey) && apiKey) || null;

    _parseConfig(this.options, opt_config);
    this._cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain
    });
    this.options.domain = this._cookieStorage.options().domain;

    _upgradeCookeData(this);
    _loadCookieData(this);

    // load deviceId and userId from input, or try to fetch existing value from cookie
    this.options.deviceId = (type(opt_config) === 'object' && type(opt_config.deviceId) === 'string' &&
        !utils.isEmptyString(opt_config.deviceId) && opt_config.deviceId) || this.options.deviceId || UUID();
    this.options.userId = (type(opt_userId) === 'string' && !utils.isEmptyString(opt_userId) && opt_userId) ||
        this.options.userId || null;

    // determine if starting new session
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

      this._sendEventsIfReady(); // try sending unsent events
    }

    if (this.options.includeUtm) {
      this._saveUtmData();
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

// parse and validate user specified config values and overwrite existing option value
// DEFAULT_OPTIONS provides list of all config keys that are modifiable, as well as expected types for values
var _parseConfig = function _parseConfig(options, config) {
  if (type(config) !== 'object') {
    return;
  }

  // verifies config value is defined, is the correct type, and some additional value verification
  var parseValidateLoad = function parseValidateLoad(key, expectedType) {
    if (type(config[key]) !== expectedType) {
      return;
    }
    if (expectedType === 'boolean') {
      options[key] = !!config[key];
    } else {
      options[key] = (expectedType === 'string' && !utils.isEmptyString(config[key]) && config[key]) ||
                     (expectedType === 'number' && config[key] > 0 && config[key]) ||
                     options[key];
    }
   };

   // the DEFAULT_OPTIONS object defines all valid keys, and provides expected types for the value
   for (var key in DEFAULT_OPTIONS) {
      if (DEFAULT_OPTIONS.hasOwnProperty(key)) {
        parseValidateLoad(key, type(DEFAULT_OPTIONS[key]));
      }
   }
};

Amplitude.prototype._apiKeySet = function _apiKeySet(methodName) {
  if (utils.isEmptyString(this.options.apiKey)) {
    utils.log('Invalid apiKey. Please set a valid apiKey with init() before calling ' + methodName);
    return false;
  }
  return true;
};

Amplitude.prototype._loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEventsString = localStorage.getItem(unsentKey);
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
 * Returns {boolean} true if a new session was created during initialization, otherwise false.
 */
Amplitude.prototype.isNewSession = function isNewSession() {
  return this._newSession;
};

/**
 * Returns {number} the id of the current session.
 */
Amplitude.prototype.getSessionId = function getSessionId() {
  return this._sessionId;
};

Amplitude.prototype._nextEventId = function _nextEventId() {
  this._eventId++;
  return this._eventId;
};

Amplitude.prototype._nextIdentifyId = function _nextIdentifyId() {
  this._identifyId++;
  return this._identifyId;
};

Amplitude.prototype._nextSequenceNumber = function _nextSequenceNumber() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

Amplitude.prototype._unsentCount = function _unsentCount() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

// returns true if sendEvents called immediately
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
    setTimeout(
      function() {
        this._updateScheduled = false;
        this.sendEvents();
      }.bind(this), this.options.eventUploadPeriodMillis
    );
  }

  return false; // an upload was scheduled, no events were uploaded
};

/**
 * cookieData (deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber)
 * can be stored in many different places (localStorage, cookie, etc).
 * Need to unify all sources into one place with a one-time upgrade/migration.
 */
var _upgradeCookeData = function _upgradeCookeData(scope) {
  // skip if migration already happened
  var cookieData = scope._cookieStorage.get(scope.options.cookieName);
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

var _loadCookieData = function _loadCookieData(scope) {
  var cookieData = scope._cookieStorage.get(scope.options.cookieName);
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

var _saveCookieData = function _saveCookieData(scope) {
  scope._cookieStorage.set(scope.options.cookieName, {
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
 * Since user properoties are propagated on server, only send once per session, don't need to send with every event
 */
Amplitude.prototype._saveUtmData = function _saveUtmData(queryParams, cookieParams) {
  queryParams = queryParams || location.search;
  cookieParams = cookieParams || this._cookieStorage.get('__utmz');
  var utmProperties = getUtmData(cookieParams, queryParams);

  // always setOnce initial utm params
  var identify = new Identify();
  for (var key in utmProperties) {
    if (utmProperties.hasOwnProperty(key)) {
      identify.setOnce('initial_' + key, utmProperties[key]);
    }
  }

  // only save utm properties if not already in session storage or if storage disabled
  var hasSessionStorage = utils.sessionStorageEnabled();
  if ((hasSessionStorage && !(sessionStorage.getItem(Constants.UTM_PROPERTIES))) || !hasSessionStorage) {
    for (var key2 in utmProperties) {
      if (utmProperties.hasOwnProperty(key2)) {
        identify.set(key2, utmProperties[key2]);
      }
    }

    if (hasSessionStorage) {
      sessionStorage.setItem(Constants.UTM_PROPERTIES, JSON.stringify(utmProperties));
    }
  }

  this.identify(identify);
};

Amplitude.prototype._getReferrer = function _getReferrer() {
  return document.referrer;
};

var _getReferringDomain = function _getReferringDomain(referrer) {
  if (referrer === null || referrer === undefined || referrer === '') {
    return null;
  }
  var parts = referrer.split('/');
  if (parts.length >= 3) {
    return parts[2];
  }
  return null;
};

// since user properties are propagated on the server, only send once per session, don't need to send with every event
Amplitude.prototype._saveReferrer = function _saveReferrer(referrer) {
  if (referrer === null || referrer === undefined || referrer === '') {
    return;
  }

  // always setOnce initial referrer
  var referring_domain = _getReferringDomain(referrer);
  var identify = new Identify().setOnce('initial_referrer', referrer);
  identify.setOnce('initial_referring_domain', referring_domain);

  // only save referrer if not already in session storage or if storage disabled
  var hasSessionStorage = utils.sessionStorageEnabled();
  if ((hasSessionStorage && !(sessionStorage.getItem(Constants.REFERRER))) || !hasSessionStorage) {
    identify.set('referrer', referrer).set('referring_domain', referring_domain);

    if (hasSessionStorage) {
      sessionStorage.setItem(Constants.REFERRER, referrer);
    }
  }

  this.identify(identify);
};

/**
 * Saves unsent events and identifies to localStorage
 */
Amplitude.prototype.saveEvents = function saveEvents() {
  if (!this._apiKeySet('saveEvents()')) {
    return;
  }

  try {
    localStorage.setItem(this.options.unsentKey, JSON.stringify(this._unsentEvents));
  } catch (e) {}

  try {
    localStorage.setItem(this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
  } catch (e) {}
};

/**
 * Sets the cookie domain
 * @param {string} domain
 */
Amplitude.prototype.setDomain = function setDomain(domain) {
  if (!this._apiKeySet('setDomain()') || !utils.validateInput(domain, 'domain', 'string')) {
    return;
  }

  try {
    this._cookieStorage.options({
      domain: domain
    });
    this.options.domain = this._cookieStorage.options().domain;
    _loadCookieData(this);
    _saveCookieData(this);
  } catch (e) {
    utils.log(e);
  }
};

/**
 * Sets an identifier for the current user.
 * @param {string} userId - identifier to set. Can be set to null.
 */
Amplitude.prototype.setUserId = function setUserId(userId) {
  if (!this._apiKeySet('setUserId()')) {
    return;
  }

  try {
    this.options.userId = (userId !== undefined && userId !== null && ('' + userId)) || null;
    _saveCookieData(this);
  } catch (e) {
    utils.log(e);
  }
};

/**
 * Sets whether to opt current user out of tracking.
 * @param {boolean} enable - if true then no events will be logged or sent.
 */
Amplitude.prototype.setOptOut = function setOptOut(enable) {
  if (!this._apiKeySet('setOptOut()') || !utils.validateInput(enable, 'enable', 'boolean')) {
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
  * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
  * @param {string} deviceId
  */
Amplitude.prototype.setDeviceId = function setDeviceId(deviceId) {
  if (!this._apiKeySet('setDeviceId()') || !utils.validateInput(deviceId, 'deviceId', 'string')) {
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
 * @param {object} - object with string keys and values representing the user properties and values to set.
 * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
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
 * See https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations for more information on user property operations.
 * @param {Identify object} identify - the identify object containing the user property operations to send.
 * @param {function} opt_callback - (optional) callback function to run when the identify event has been sent.
 *        Note: the server response code and response body from the identify event upload are passed to the callback function.
 */
Amplitude.prototype.identify = function(identify, opt_callback) {
  if (!this._apiKeySet('identify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent');
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify) === 'object' && identify.hasOwnProperty('_q')) {
    var instance = new Identify();
    for (var i = 0; i < identify._q.length; i++) {
        var fn = instance[identify._q[i][0]];
        if (type(fn) === 'function') {
          fn.apply(instance, identify._q[i].slice(1));
        }
    }
    identify = instance;
  }

  if (identify instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify.userPropertiesOperations).length > 0) {
      return this._logEvent(Constants.IDENTIFY_EVENT, null, null, identify.userPropertiesOperations, opt_callback);
    }
  } else {
    utils.log('Invalid identify input type. Expected Identify object but saw ' + type(identify));
  }

  if (type(opt_callback) === 'function') {
    opt_callback(0, 'No request sent');
  }
};

/**
 * Set a versionName for your application.
 * @param {string} versionName
 */
Amplitude.prototype.setVersionName = function setVersionName(versionName) {
  if (!utils.validateInput(versionName, 'versionName', 'string')) {
    return;
  }
  this.options.versionName = versionName;
};

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 */
Amplitude.prototype._logEvent = function _logEvent(eventType, eventProperties, apiProperties, userProperties, callback) {
  if (type(callback) !== 'function') {
    callback = null;
  }

  _loadCookieData(this); // reload cookie before each log event to sync event meta-data between windows and tabs
  if (!eventType || this.options.optOut) {
    if (callback) {
      callback(0, 'No request sent');
    }
    return;
  }

  try {
    var eventId;
    if (eventType === Constants.IDENTIFY_EVENT) {
      eventId = this._nextIdentifyId();
    } else {
      eventId = this._nextEventId();
    }
    var sequenceNumber = this._nextSequenceNumber();
    var eventTime = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }
    this._lastEventTime = eventTime;
    _saveCookieData(this);

    userProperties = (type(userProperties) === 'object' && userProperties) || {};
    apiProperties = apiProperties || {};
    eventProperties = (type(eventProperties) === 'object' && eventProperties) || {};
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

// Remove old events from the beginning of the array if too many have accumulated. Default limit is 1000 events.
Amplitude.prototype._limitEventsQueued = function _limitEventsQueued(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};

/**
 * Log event with event type and event properties
 * @param {string} eventType - name of event to log
 * @param {object} eventProperties - (optional) an object with string keys and values representing the event properties
 * @param {function} opt_callback - (optional) a callback function to run after the event is logged
 *        Note: the server response code and response body from the identify event upload are passed to the callback function.
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

// Test that n is a number or a numeric value.
var _isNumber = function _isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Log revenue event with a price, quantity, and product identifier.
 * @param {number} price - price of revenue event
 * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
 * @param {string} product - (optional) product identifier
 */
Amplitude.prototype.logRevenue = function logRevenue(price, quantity, product) {
  // Test that the parameters are of the right type.
  if (!this._apiKeySet('logRevenue()') || !_isNumber(price) || quantity !== undefined && !_isNumber(quantity)) {
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
 * Remove events in storage with event ids up to and including maxEventId. Does
 * a true filter in case events get out of order or old events are removed.
 */
Amplitude.prototype._removeEvents = function _removeEvents(eventQueue, maxId) {
  if (maxId < 0) {
    return;
  }

  var filteredEvents = [];
  for (var i = 0; i < this[eventQueue].length || 0; i++) {
    if (this[eventQueue][i].event_id > maxId) {
      filteredEvents.push(this[eventQueue][i]);
    }
  }
  this[eventQueue] = filteredEvents;
};

/**
 * Send unsent events.
 * @param {function} callback - (optional) callback to run after events are sent.
 *            Note the server response code and response body are passed to the callback as input arguments.
 */
Amplitude.prototype.sendEvents = function sendEvents(callback) {
  if (!this._apiKeySet('sendEvents()')) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent');
    }
    return;
  }

  if (!this._sending && !this.options.optOut && this._unsentCount() > 0) {
    this._sending = true;
    var url = ('https:' === window.location.protocol ? 'https' : 'http') + '://' +
        this.options.apiEndpoint + '/';

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
          scope._removeEvents('_unsentEvents', maxEventId);
          scope._removeEvents('_unsentIdentifys', maxIdentifyId);

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
            scope._removeEvents('_unsentEvents', maxEventId);
            scope._removeEvents('_unsentIdentifys', maxIdentifyId);
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
  } else if (type(callback) === 'function') {
    callback(0, 'No request sent');
  }
};

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
 *  @deprecated
 */
Amplitude.prototype.setGlobalUserProperties = Amplitude.prototype.setUserProperties;

Amplitude.prototype.__VERSION__ = version;

module.exports = Amplitude;
