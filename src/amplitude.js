import AmplitudeClient from './amplitude-client';
import Constants from './constants';
import Identify from './identify';
import Revenue from './revenue';
import type from './type';
import utils from './utils';
import { version } from '../package.json';
import DEFAULT_OPTIONS from './options';

/**
 * Deprecated legacy API of the Amplitude JS SDK - instance manager.
 *
 * Wraps around the current [AmplitudeClient](https://amplitude.github.io/Amplitude-JavaScript/) which provides more features
 * Function calls directly on amplitude have been deprecated. Please call methods on the default shared instance: amplitude.getInstance() instead.
 *
 * See the [3.0.0 changelog](https://github.com/amplitude/Amplitude-JavaScript/blob/ed405afb5f06d5cf5b72539a5d09179abcf7e1fe/README.md#300-update-and-logging-events-to-multiple-amplitude-apps) for more information about this change.
 * @constructor Amplitude
 * @public
 * @deprecated
 * @example var amplitude = new Amplitude();
 */
var Amplitude = function Amplitude() {
  this.options = { ...DEFAULT_OPTIONS };
  this._q = [];
  this._instances = {}; // mapping of instance names to instances
};

Amplitude.prototype.Identify = Identify;
Amplitude.prototype.Revenue = Revenue;

Amplitude.prototype.getInstance = function getInstance(instance) {
  instance = utils.isEmptyString(instance) ? Constants.DEFAULT_INSTANCE : instance.toLowerCase();
  var client = this._instances[instance];
  if (client === undefined) {
    client = new AmplitudeClient(instance);
    this._instances[instance] = client;
  }
  return client;
};

if (BUILD_COMPAT_SNIPPET) {
  /**
   * Run functions queued up by proxy loading snippet
   * @private
   */
  Amplitude.prototype.runQueuedFunctions = function () {
    // run queued up old versions of functions
    for (var i = 0; i < this._q.length; i++) {
      var fn = this[this._q[i][0]];
      if (type(fn) === 'function') {
        fn.apply(this, this._q[i].slice(1));
      }
    }
    this._q = []; // clear function queue after running

    // run queued up functions on instances
    for (var instance in this._instances) {
      if (Object.prototype.hasOwnProperty.call(this._instances, instance)) {
        this._instances[instance].runQueuedFunctions();
      }
    }
  };
}

if (BUILD_COMPAT_2_0) {
  /**
   * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
   * This is required before any other methods can be called.
   * @public
   * @param {string} apiKey - The API key for your app.
   * @param {string} opt_userId - (optional) An identifier for this user.
   * @param {object} opt_config - (optional) Configuration options.
   * See [options.js](https://github.com/amplitude/Amplitude-JavaScript/blob/master/src/options.js#L14) for list of options and default values.
   * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
   * @deprecated Please use amplitude.getInstance().init(apiKey, opt_userId, opt_config, opt_callback);
   * @example amplitude.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
   */
  Amplitude.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
    this.getInstance().init(
      apiKey,
      opt_userId,
      opt_config,
      function (instance) {
        // make options such as deviceId available for callback functions
        this.options = instance.options;
        if (type(opt_callback) === 'function') {
          opt_callback(instance);
        }
      }.bind(this),
    );
  };

  /**
   * Returns true if a new session was created during initialization, otherwise false.
   * @public
   * @return {boolean} Whether a new session was created during initialization.
   * @deprecated Please use amplitude.getInstance().isNewSession();
   */
  Amplitude.prototype.isNewSession = function isNewSession() {
    return this.getInstance().isNewSession();
  };

  /**
   * Returns the id of the current session.
   * @public
   * @return {number} Id of the current session.
   * @deprecated Please use amplitude.getInstance().getSessionId();
   */
  Amplitude.prototype.getSessionId = function getSessionId() {
    return this.getInstance().getSessionId();
  };

  /**
   * Increments the eventId and returns it.
   * @private
   */
  Amplitude.prototype.nextEventId = function nextEventId() {
    return this.getInstance().nextEventId();
  };

  /**
   * Increments the identifyId and returns it.
   * @private
   */
  Amplitude.prototype.nextIdentifyId = function nextIdentifyId() {
    return this.getInstance().nextIdentifyId();
  };

  /**
   * Increments the sequenceNumber and returns it.
   * @private
   */
  Amplitude.prototype.nextSequenceNumber = function nextSequenceNumber() {
    return this.getInstance().nextSequenceNumber();
  };

  /**
   * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
   * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
   * @private
   */
  Amplitude.prototype.saveEvents = function saveEvents() {
    this.getInstance().saveEvents();
  };

  /**
   * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
   * @public
   * @param {string} domain to set.
   * @deprecated Please use amplitude.getInstance().setDomain(domain);
   * @example amplitude.setDomain('.amplitude.com');
   */
  Amplitude.prototype.setDomain = function setDomain(domain) {
    this.getInstance().setDomain(domain);
  };

  /**
   * Sets an identifier for the current user.
   * @public
   * @param {string} userId - identifier to set. Can be null.
   * @deprecated Please use amplitude.getInstance().setUserId(userId);
   * @example amplitude.setUserId('joe@gmail.com');
   */
  Amplitude.prototype.setUserId = function setUserId(userId) {
    this.getInstance().setUserId(userId);
  };

  /**
   * Add user to a group or groups. You need to specify a groupType and groupName(s).
   * For example you can group people by their organization.
   * In that case groupType is "orgId" and groupName would be the actual ID(s).
   * groupName can be a string or an array of strings to indicate a user in multiple gruups.
   * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
   * Note: this will also set groupType: groupName as a user property.
   * See the [advanced topics article](https://developers.amplitude.com/docs/javascript#user-groups) for more information.
   * @public
   * @param {string} groupType - the group type (ex: orgId)
   * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
   * @deprecated Please use amplitude.getInstance().setGroup(groupType, groupName);
   * @example amplitude.setGroup('orgId', 15); // this adds the current user to orgId 15.
   */
  Amplitude.prototype.setGroup = function (groupType, groupName) {
    this.getInstance().setGroup(groupType, groupName);
  };

  /**
   * Sets whether to opt current user out of tracking.
   * @public
   * @param {boolean} enable - if true then no events will be logged or sent.
   * @deprecated Please use amplitude.getInstance().setOptOut(enable);
   * @example: amplitude.setOptOut(true);
   */
  Amplitude.prototype.setOptOut = function setOptOut(enable) {
    this.getInstance().setOptOut(enable);
  };

  /**
   * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
   * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
   * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
   * This uses src/uuid.js to regenerate the deviceId.
   * @public
   * @deprecated Please use amplitude.getInstance().regenerateDeviceId();
   */
  Amplitude.prototype.regenerateDeviceId = function regenerateDeviceId() {
    this.getInstance().regenerateDeviceId();
  };

  /**
   * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
   * (like if you have your own system for managing deviceIds).
   *
   * Make sure the deviceId you set is sufficiently unique
   * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
   * @public
   * @param {string} deviceId - custom deviceId for current user.
   * @deprecated Please use amplitude.getInstance().setDeviceId(deviceId);
   * @example amplitude.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
   */
  Amplitude.prototype.setDeviceId = function setDeviceId(deviceId) {
    this.getInstance().setDeviceId(deviceId);
  };

  /**
   * Sets user properties for the current user.
   * @public
   * @param {object} userProperties - object with string keys and values for the user properties to set.
   * @param {boolean} opt_replace - Deprecated. In earlier versions of the JS SDK the user properties object was kept in
   * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
   * @deprecated Please use amplitude.getInstance().setUserProperties(userProperties);
   * @example amplitude.setUserProperties({'gender': 'female', 'sign_up_complete': true})
   */
  Amplitude.prototype.setUserProperties = function setUserProperties(userProperties) {
    this.getInstance().setUserProperties(userProperties);
  };

  /**
   * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
   * @public
   * @deprecated Please use amplitude.getInstance().clearUserProperties();
   * @example amplitude.clearUserProperties();
   */
  Amplitude.prototype.clearUserProperties = function clearUserProperties() {
    this.getInstance().clearUserProperties();
  };

  /**
   * Send an identify call containing user property operations to Amplitude servers.
   * See the [Identify](https://amplitude.github.io/Amplitude-JavaScript/Identify/)
   * reference page for more information on the Identify API and user property operations.
   * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
   * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
   * Note: the server response code and response body from the identify event upload are passed to the callback function.
   * @deprecated Please use amplitude.getInstance().identify(identify);
   * @example
   * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
   * amplitude.identify(identify);
   */
  Amplitude.prototype.identify = function (identify_obj, opt_callback) {
    this.getInstance().identify(identify_obj, opt_callback);
  };

  /**
   * Set a versionName for your application.
   * @public
   * @param {string} versionName - The version to set for your application.
   * @deprecated Please use amplitude.getInstance().setVersionName(versionName);
   * @example amplitude.setVersionName('1.12.3');
   */
  Amplitude.prototype.setVersionName = function setVersionName(versionName) {
    this.getInstance().setVersionName(versionName);
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
   * @deprecated Please use amplitude.getInstance().logEvent(eventType, eventProperties, opt_callback);
   * @example amplitude.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
   */
  Amplitude.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
    return this.getInstance().logEvent(eventType, eventProperties, opt_callback);
  };

  /**
   * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
   *
   * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
   * (unless you explicitly set it with setGroup).
   *
   * See the [advanced topics article](https://developers.amplitude.com/docs/javascript#user-groups) for more information
   * about groups and Count by Distinct on the Amplitude platform.
   * @public
   * @param {string} eventType - name of event
   * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
   * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
   * groupName can be a string or an array of strings.
   * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
   * Note: the server response code and response body from the event upload are passed to the callback function.
   * @deprecated Please use amplitude.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
   * @example amplitude.logEventWithGroups('Clicked Button', null, {'orgId': 24});
   */
  Amplitude.prototype.logEventWithGroups = function (eventType, eventProperties, groups, opt_callback) {
    return this.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
  };

  /**
   * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
   * revenueType and event properties.
   *
   * See the [Revenue](https://amplitude.github.io/Amplitude-JavaScript/Revenue/)
   * reference page for more information on the Revenue interface and logging revenue.
   * @public
   * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
   * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
   * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
   * amplitude.logRevenueV2(revenue);
   */
  Amplitude.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
    return this.getInstance().logRevenueV2(revenue_obj);
  };

  /**
   * Log revenue event with a price, quantity, and product identifier.
   * @public
   * @param {number} price - price of revenue event
   * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
   * @param {string} product - (optional) product identifier
   * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
   * @example amplitude.logRevenue(3.99, 1, 'product_1234');
   */
  Amplitude.prototype.logRevenue = function logRevenue(price, quantity, product) {
    return this.getInstance().logRevenue(price, quantity, product);
  };

  /**
   * Remove events in storage with event ids up to and including maxEventId.
   * @private
   */
  Amplitude.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
    this.getInstance().removeEvents(maxEventId, maxIdentifyId);
  };

  /**
   * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
   * If batchEvents is true, then events are only sent when batch criterias are met.
   * @private
   * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
   * Note the server response code and response body are passed to the callback as input arguments.
   */
  Amplitude.prototype.sendEvents = function sendEvents(callback) {
    this.getInstance().sendEvents(callback);
  };

  /**
   * Set global user properties.
   * @public
   * @deprecated Please use amplitudeClient.setUserProperties
   */
  Amplitude.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
    this.getInstance().setUserProperties(userProperties);
  };
}

/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */
Amplitude.prototype.__VERSION__ = version;

export default Amplitude;
