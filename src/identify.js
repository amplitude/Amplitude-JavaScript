var type = require('./type');

/*
 * Wrapper for a user properties JSON object that supports operations.
 * Note: if a user property is used in multiple operations on the same Identify object,
 * only the first operation will be saved, and the rest will be ignored.
 */

// maps operation to identify string and proxy key
// order listed also defines order of processing
var OPERATIONS = {
  'AMP_OP_SET_ONCE': {'opString': '$setOnce', 'proxyKey': 'so'},
  'AMP_OP_UNSET': {'opString': '$unset', 'proxyKey': 'u'},
  'AMP_OP_SET': {'opString': '$set', 'proxyKey': 's'},
  'AMP_OP_ADD': {'opString': '$add', 'proxyKey': 'a'}
};

var log = function(s) {
  console.log('[Amplitude] ' + s);
};

var Identify = function() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};

Identify.prototype.fromProxyObject = function(proxyObject) {
  if (!('p' in proxyObject)) {
    return this;
  }
  Object.keys(OPERATIONS).forEach(function(operation) {
    this._addOperationsFromProxyObjectDictionary(operation, proxyObject.p);
  }.bind(this));
  return this;
};

Identify.prototype._addOperationsFromProxyObjectDictionary = function(operation, proxyObjectDict) {
  var proxyKey = OPERATIONS[operation].proxyKey;
  if (!(proxyKey in proxyObjectDict)) {
    return;
  }
  var userPropertiesOperations = proxyObjectDict[proxyKey];
  Object.keys(userPropertiesOperations).forEach(function(key) {
    this._addOperation(operation, key, userPropertiesOperations[key]);
  }.bind(this));
};

Identify.prototype.add = function(property, value) {
  if (type(value) === 'number' || type(value) === 'string') {
    this._addOperation('AMP_OP_ADD', property, value);
  } else {
    log('Unsupported type for value: ' + type(value) + ', expecting number or string');
  }
  return this;
};

Identify.prototype.set = function(property, value) {
  this._addOperation('AMP_OP_SET', property, value);
  return this;
};

Identify.prototype.setOnce = function(property, value) {
  this._addOperation('AMP_OP_SET_ONCE', property, value);
  return this;
};

Identify.prototype.unset = function(property) {
  this._addOperation('AMP_OP_UNSET', property, '-');
  return this;
};

Identify.prototype._addOperation = function(operation, property, value) {
  var opString = OPERATIONS[operation].opString;
  // check that property wasn't already used in this Identify
  if (this.properties.indexOf(property) !== -1) {
    log('User property "' + property + '" already used in this identify, skipping operation ' + opString);
    return;
  }

  if (!(opString in this.userPropertiesOperations)){
    this.userPropertiesOperations[opString] = {};
  }
  this.userPropertiesOperations[opString][property] = value;
  this.properties.push(property);
};

module.exports = Identify;
