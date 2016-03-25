var AmplitudeClient = require('./amplitude-client');
var Identify = require('./identify');
var object = require('object');
var type = require('./type');
var utils = require('./utils');
var version = require('./version');
var DEFAULT_OPTIONS = require('./options');

var DEFAULT_INSTANCE = '$default_instance';

var Amplitude = function() {
  this.options = object.merge({}, DEFAULT_OPTIONS); // maintain a copy for backwards compatibilty
  this._instances = {}; // mapping of instance names to instances
};

Amplitude.prototype.getInstance = function(instance) {
  instance = (utils.isEmptyString(instance) ? DEFAULT_INSTANCE : instance).toLowerCase();

  var client = this._instances[instance];
  if (client === undefined) {
    client = new AmplitudeClient(instance);
    this._instances[instance] = client;
  }
  return client;
};

Amplitude.prototype.Identify = Identify;

Amplitude.prototype.runQueuedFunctions = function () {
  // run queued up old version of functions
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (fn && type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running

  // run queued up functions on instances
  for (var instance in this._instances) {
    if (this._instances.hasOwnProperty(instance)) {
      this._instances[instance].runQueuedFunctions();
    }
  }
};

/**
 *  @deprecated
 *  Maintain mapping of old functions to new instance methods
 */
Amplitude.prototype.init = function(apiKey, opt_userId, opt_config, callback) {
  this.getInstance().init(apiKey, opt_userId, opt_config, function(instance) {
    // make options such as deviceId available for callback functions
    this.options = instance.options;
    if (callback && type(callback) === 'function') {
      callback(instance);
    }
  }.bind(this));
};

Amplitude.prototype.isNewSession = function() {
  return this.getInstance().isNewSession();
};

Amplitude.prototype.getSessionId = function() {
  return this.getInstance().getSessionId();
};

Amplitude.prototype.nextEventId = function() {
  return this.getInstance().nextEventId();
};

Amplitude.prototype.nextIdentifyId = function() {
  return this.getInstance().nextIdentifyId();
};

Amplitude.prototype.nextSequenceNumber = function() {
  return this.getInstance().nextSequenceNumber();
};

Amplitude.prototype.saveEvents = function() {
  this.getInstance().saveEvents();
};

Amplitude.prototype.setDomain = function(domain) {
  this.getInstance().setDomain(domain);
};

Amplitude.prototype.setUserId = function(userId) {
  this.getInstance().setUserId(userId);
};

Amplitude.prototype.setGroup = function(groupType, groupName) {
  this.getInstance().setGroup(groupType, groupName);
};

Amplitude.prototype.setOptOut = function(enable) {
  this.getInstance().setOptOut(enable);
};

Amplitude.prototype.setDeviceId = function(deviceId) {
  this.getInstance().setDeviceId(deviceId);
};

Amplitude.prototype.setUserProperties = function(userProperties) {
  this.getInstance().setUserProperties(userProperties);
};

Amplitude.prototype.clearUserProperties = function(){
  this.getInstance().clearUserProperties();
};

Amplitude.prototype.identify = function(identify, callback) {
  this.getInstance().identify(identify, callback);
};

Amplitude.prototype.setVersionName = function(versionName) {
  this.getInstance().setVersionName(versionName);
};

Amplitude.prototype.logEvent = function(eventType, eventProperties, callback) {
  return this.getInstance().logEvent(eventType, eventProperties, callback);
};

Amplitude.prototype.logEventWithGroups = function(eventType, eventProperties, groups, callback) {
  return this.getInstance().logEventWithGroups(eventType, eventProperties, groups, callback);
};

Amplitude.prototype.logRevenue = function(price, quantity, product) {
  return this.getInstance().logRevenue(price, quantity, product);
};

Amplitude.prototype.removeEvents = function (maxEventId, maxIdentifyId) {
  this.getInstance().removeEvents(maxEventId, maxIdentifyId);
};

Amplitude.prototype.sendEvents = function(callback) {
  this.getInstance().sendEvents(callback);
};

Amplitude.prototype.setGlobalUserProperties = Amplitude.prototype.setUserProperties;

Amplitude.prototype.__VERSION__ = version;

module.exports = Amplitude;
