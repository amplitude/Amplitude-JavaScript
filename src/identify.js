/*
 * Wrapper for a user properties JSON object that supports operations
 */

var AMP_OP_ADD = '$add';
var AMP_OP_SET = '$set';
var AMP_OP_SET_ONCE = '$setOnce';
var AMP_OP_UNSET = '$unset';


var Identify = function() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};

var isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

Identify.prototype.add = function(property, value) {
  if (isNumeric(value) || typeof(value) === 'string' || value instanceof String) {
    this._addOperation(AMP_OP_ADD, property, value);
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
    return;
  }

  if (!(operation in this.userPropertiesOperations)){
    this.userPropertiesOperations[operation] = {};
  }
  this.userPropertiesOperations[operation][property] = value;
  this.properties.push(property);
};

module.exports = Identify;
