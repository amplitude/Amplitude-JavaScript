var type = require('./type');

/*
 * Wrapper for a user properties JSON object that supports operations.
 * Note: if a user property is used in multiple operations on the same Identify object,
 * only the first operation will be saved, and the rest will be ignored.
 */

var AMP_OP_ADD = '$add';
var AMP_OP_SET = '$set';
var AMP_OP_SET_ONCE = '$setOnce';
var AMP_OP_UNSET = '$unset';

var log = function(s) {
  console.log('[Amplitude] ' + s);
};


var Identify = function() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};

Identify.prototype.fromProxyObject = function(proxyObject) {
  this._addOperationsFromProxyObjectDictionary(AMP_OP_SET_ONCE, proxyObject, 'so');
  this._addOperationsFromProxyObjectDictionary(AMP_OP_UNSET, proxyObject, 'u');
  this._addOperationsFromProxyObjectDictionary(AMP_OP_SET, proxyObject, 's');
  this._addOperationsFromProxyObjectDictionary(AMP_OP_ADD, proxyObject, 'a');
  return this;
};

Identify.prototype._addOperationsFromProxyObjectDictionary = function(operation, proxyObject, dictionary) {
  if (dictionary in proxyObject.p) {
    for (var key in proxyObject.p[dictionary]) {
      if (proxyObject.p[dictionary].hasOwnProperty(key)) {
        this._addOperation(operation, key, proxyObject.p[dictionary][key]);
      }
    }
  }
};

Identify.prototype.add = function(property, value) {
  if (type(value) === 'number' || type(value) === 'string') {
    this._addOperation(AMP_OP_ADD, property, value);
  } else {
    log('Unsupported type for value: ' + type(value) + ', expecting number or string');
  }
  return this;
};

Identify.prototype.set = function(property, value) {
  this._addOperation(AMP_OP_SET, property, value);
  return this;
};

Identify.prototype.setOnce = function(property, value) {
  this._addOperation(AMP_OP_SET_ONCE, property, value);
  return this;
};

Identify.prototype.unset = function(property) {
  this._addOperation(AMP_OP_UNSET, property, '-');
  return this;
};

Identify.prototype._addOperation = function(operation, property, value) {
  // check that property wasn't already used in this Identify
  if (this.properties.indexOf(property) !== -1) {
    log('User property "' + property + '" already used in this identify, skipping operation ' + operation);
    return;
  }

  if (!(operation in this.userPropertiesOperations)){
    this.userPropertiesOperations[operation] = {};
  }
  this.userPropertiesOperations[operation][property] = value;
  this.properties.push(property);
};

module.exports = Identify;
