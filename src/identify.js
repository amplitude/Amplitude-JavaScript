import type from './type';
import utils from './utils';

/*
 * Wrapper for a user properties JSON object that supports operations.
 * Note: if a user property is used in multiple operations on the same Identify object,
 * only the first operation will be saved, and the rest will be ignored.
 */

var AMP_OP_ADD = '$add';
var AMP_OP_APPEND = '$append';
var AMP_OP_CLEAR_ALL = '$clearAll';
var AMP_OP_PREPEND = '$prepend';
var AMP_OP_SET = '$set';
var AMP_OP_SET_ONCE = '$setOnce';
var AMP_OP_UNSET = '$unset';

/**
 * Identify API - instance constructor. Identify objects are a wrapper for user property operations.
 * Each method adds a user property operation to the Identify object, and returns the same Identify object,
 * allowing you to chain multiple method calls together.
 * Note: if the same user property is used in multiple operations on a single Identify object,
 * only the first operation on that property will be saved, and the rest will be ignored.
 * @constructor Identify
 * @public
 * @example var identify = new amplitude.Identify();
 */
var Identify = function() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};

/**
 * Increment a user property by a given value (can also be negative to decrement).
 * If the user property does not have a value set yet, it will be initialized to 0 before being incremented.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string} value - The amount by which to increment the user property. Allows numbers as strings (ex: '123').
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().add('karma', 1).add('friends', 1);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.add = function(property, value) {
  if (type(value) === 'number' || type(value) === 'string') {
    this._addOperation(AMP_OP_ADD, property, value);
  } else {
    utils.log.error('Unsupported type for value: ' + type(value) + ', expecting number or string');
  }
  return this;
};

/**
 * Append a value or values to a user property.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are appended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values appended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to append.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().append('ab-tests', 'new-user-tests');
 * identify.append('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.append = function(property, value) {
  this._addOperation(AMP_OP_APPEND, property, value);
  return this;
};

/**
 * Clear all user properties for the current user.
 * SDK user should instead call amplitude.clearUserProperties() instead of using this.
 * $clearAll needs to be sent on its own Identify object. If there are already other operations, then don't add $clearAll.
 * If $clearAll already in an Identify object, don't allow other operations to be added.
 * @private
 */
Identify.prototype.clearAll = function() {
  if (Object.keys(this.userPropertiesOperations).length > 0) {
    if (!this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
      utils.log.error('Need to send $clearAll on its own Identify object without any other operations, skipping $clearAll');
    }
    return this;
  }
  this.userPropertiesOperations[AMP_OP_CLEAR_ALL] = '-';
  return this;
};

/**
 * Prepend a value or values to a user property.
 * Prepend means inserting the value or values at the front of a list.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are prepended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values prepended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to prepend.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().prepend('ab-tests', 'new-user-tests');
 * identify.prepend('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.prepend = function(property, value) {
  this._addOperation(AMP_OP_PREPEND, property, value);
  return this;
};

/**
 * Sets the value of a given user property. If a value already exists, it will be overwriten with the new value.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|boolean|object} value - A value or values to set.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().set('user_type', 'beta');
 * identify.set('name', {'first': 'John', 'last': 'Doe'}); // dict is flattened and becomes name.first: John, name.last: Doe
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.set = function(property, value) {
  this._addOperation(AMP_OP_SET, property, value);
  return this;
};

/**
 * Sets the value of a given user property only once. Subsequent setOnce operations on that user property will be ignored;
 * however, that user property can still be modified through any of the other operations.
 * Useful for capturing properties such as 'initial_signup_date', 'initial_referrer', etc.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|boolean|object} value - A value or values to set once.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().setOnce('sign_up_date', '2016-04-01');
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.setOnce = function(property, value) {
  this._addOperation(AMP_OP_SET_ONCE, property, value);
  return this;
};

/**
 * Unset and remove a user property. This user property will no longer show up in a user's profile.
 * @public
 * @param {string} property - The user property key.
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().unset('user_type').unset('age');
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.unset = function(property) {
  this._addOperation(AMP_OP_UNSET, property, '-');
  return this;
};

/**
 * Helper function that adds operation to the Identify's object
 * Handle's filtering of duplicate user property keys, and filtering for clearAll.
 * @private
 */
Identify.prototype._addOperation = function(operation, property, value) {
  // check that the identify doesn't already contain a clearAll
  if (this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
    utils.log.error('This identify already contains a $clearAll operation, skipping operation ' + operation);
    return;
  }

  // check that property wasn't already used in this Identify
  if (this.properties.indexOf(property) !== -1) {
    utils.log.error('User property "' + property + '" already used in this identify, skipping operation ' + operation);
    return;
  }

  if (!this.userPropertiesOperations.hasOwnProperty(operation)){
    this.userPropertiesOperations[operation] = {};
  }
  this.userPropertiesOperations[operation][property] = value;
  this.properties.push(property);
};

export default Identify;
