import utils from './utils';

var getUtmData = function getUtmData(rawCookie, query) {
  // Translate the utmz cookie format into url query string format.
  var cookie = rawCookie ? '?' + rawCookie.split('.').slice(-1)[0].replace(/\|/g, '&') : '';

  var fetchParam = function fetchParam(queryName, query, cookieName, cookie) {
    return utils.getQueryParam(queryName, query) ||
           utils.getQueryParam(cookieName, cookie);
  };

  var utmSource = fetchParam('utm_source', query, 'utmcsr', cookie);
  var utmMedium = fetchParam('utm_medium', query, 'utmcmd', cookie);
  var utmCampaign = fetchParam('utm_campaign', query, 'utmccn', cookie);
  var utmTerm = fetchParam('utm_term', query, 'utmctr', cookie);
  var utmContent = fetchParam('utm_content', query, 'utmcct', cookie);

  var utmData = {};
  var addIfNotNull = function addIfNotNull(key, value) {
    if (!utils.isEmptyString(value)) {
      utmData[key] = value;
    }
  };

  addIfNotNull('utm_source', utmSource);
  addIfNotNull('utm_medium', utmMedium);
  addIfNotNull('utm_campaign', utmCampaign);
  addIfNotNull('utm_term', utmTerm);
  addIfNotNull('utm_content', utmContent);

  return utmData;
};

export default getUtmData;
