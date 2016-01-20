var AmplitudeClient = require('./amplitude-client');
var Identify = require('./identify');
var language = require('./language');
var object = require('object');
var type = require('./type');
var version = require('./version');

var DEFAULT_OPTIONS = {
  apiEndpoint: 'api.amplitude.com',
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  domain: undefined,
  includeUtm: false,
  language: language.language,
  optOut: false,
  platform: 'Web',
  savedMaxCount: 1000,
  saveEvents: true,
  sessionTimeout: 30 * 60 * 1000,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100,
  batchEvents: false,
  eventUploadThreshold: 30,
  eventUploadPeriodMillis: 30 * 1000 // 30s
};
var DEFAULT_INSTANCE = '$defaultInstance';

var Amplitude = function() {
  this.options = object.merge({}, DEFAULT_OPTIONS);
  this._instances = {}; // mapping of instance names to instances
};

Amplitude.prototype.getInstance = function(instance) {
  instance = instance || DEFAULT_INSTANCE;
  if (!(instance in this._instances)) {
    this._instances[instance] = new AmplitudeClient();
  }
  return this._instances[instance];
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
  this.getInstance().init(apiKey, opt_userId, opt_config, function() {
    window.amplitude.options = window.amplitude.getInstance().options;
    callback();
  });
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

Amplitude.prototype.identify = function(identify) {
  this.getInstance().identify(identify);
};

Amplitude.prototype.setVersionName = function(versionName) {
  this.getInstance().setVersionName(versionName);
};

Amplitude.prototype.logEvent = function(eventType, eventProperties, callback) {
  return this.getInstance().logEvent(eventType, eventProperties, callback);
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
