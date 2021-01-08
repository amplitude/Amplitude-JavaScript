import constants from './constants';
import type from './type';
import utils from './utils';

/**
 * Revenue API - instance constructor. Wrapper for logging Revenue data. Revenue objects get passed to amplitude.logRevenueV2 to send to Amplitude servers.
 * Each method updates a revenue property in the Revenue object, and returns the same Revenue object,
 * allowing you to chain multiple method calls together.
 *
 * Note: price is a required field to log revenue events.
 * If quantity is not specified then defaults to 1.
 * @constructor Revenue
 * @public
 * @example var revenue = new amplitude.Revenue();
 */
var Revenue = function Revenue() {
  // required fields
  this._price = null;

  // optional fields
  this._productId = null;
  this._quantity = 1;
  this._revenueType = null;
  this._properties = null;
};

/**
 * Set a value for the product identifer.
 * @public
 * @param {string} productId - The value for the product identifier. Empty and invalid strings are ignored.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setProductId = function setProductId(productId) {
  if (type(productId) !== 'string') {
    utils.log.error('Unsupported type for productId: ' + type(productId) + ', expecting string');
  } else if (utils.isEmptyString(productId)) {
    utils.log.error('Invalid empty productId');
  } else {
    this._productId = productId;
  }
  return this;
};

/**
 * Set a value for the quantity. Note revenue amount is calculated as price * quantity.
 * @public
 * @param {number} quantity - Integer value for the quantity. If not set, quantity defaults to 1.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setQuantity(5);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setQuantity = function setQuantity(quantity) {
  if (type(quantity) !== 'number') {
    utils.log.error('Unsupported type for quantity: ' + type(quantity) + ', expecting number');
  } else {
    this._quantity = parseInt(quantity);
  }
  return this;
};

/**
 * Set a value for the price. This field is required for all revenue being logged.
 *
 * Note: revenue amount is calculated as price * quantity.
 * @public
 * @param {number} price - Double value for the quantity.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setPrice = function setPrice(price) {
  if (type(price) !== 'number') {
    utils.log.error('Unsupported type for price: ' + type(price) + ', expecting number');
  } else {
    this._price = price;
  }
  return this;
};

/**
 * Set a value for the revenueType (for example purchase, cost, tax, refund, etc).
 * @public
 * @param {string} revenueType - RevenueType to designate.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setRevenueType('purchase');
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setRevenueType = function setRevenueType(revenueType) {
  if (type(revenueType) !== 'string') {
    utils.log.error('Unsupported type for revenueType: ' + type(revenueType) + ', expecting string');
  } else {
    this._revenueType = revenueType;
  }
  return this;
};

/**
 * Set event properties for the revenue event.
 * @public
 * @param {object} eventProperties - Revenue event properties to set.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var event_properties = {'city': 'San Francisco'};
 * var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setEventProperties(event_properties);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setEventProperties = function setEventProperties(eventProperties) {
  if (type(eventProperties) !== 'object') {
    utils.log.error('Unsupported type for eventProperties: ' + type(eventProperties) + ', expecting object');
  } else {
    this._properties = utils.validateProperties(eventProperties);
  }
  return this;
};

/**
 * @private
 */
Revenue.prototype._isValidRevenue = function _isValidRevenue() {
  if (type(this._price) !== 'number') {
    utils.log.error('Invalid revenue, need to set price field');
    return false;
  }
  return true;
};

/**
 * @private
 */
Revenue.prototype._toJSONObject = function _toJSONObject() {
  var obj = type(this._properties) === 'object' ? this._properties : {};

  if (this._productId !== null) {
    obj[constants.REVENUE_PRODUCT_ID] = this._productId;
  }
  if (this._quantity !== null) {
    obj[constants.REVENUE_QUANTITY] = this._quantity;
  }
  if (this._price !== null) {
    obj[constants.REVENUE_PRICE] = this._price;
  }
  if (this._revenueType !== null) {
    obj[constants.REVENUE_REVENUE_TYPE] = this._revenueType;
  }
  return obj;
};

export default Revenue;
