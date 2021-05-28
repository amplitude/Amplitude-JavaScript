import utils from './utils';
import Constants from './constants';

var getUtmData = function getUtmData(rawCookie, query) {
  // Translate the utmz cookie format into url query string format.
  var cookie = rawCookie ? '?' + rawCookie.split('.').slice(-1)[0].replace(/\|/g, '&') : '';

  var fetchParam = function fetchParam(queryName, query, cookieName, cookie) {
    return utils.getQueryParam(queryName, query) || utils.getQueryParam(cookieName, cookie);
  };

  var utmSource = fetchParam(Constants.UTM_SOURCE, query, 'utmcsr', cookie);
  var utmMedium = fetchParam(Constants.UTM_MEDIUM, query, 'utmcmd', cookie);
  var utmCampaign = fetchParam(Constants.UTM_CAMPAIGN, query, 'utmccn', cookie);
  var utmTerm = fetchParam(Constants.UTM_TERM, query, 'utmctr', cookie);
  var utmContent = fetchParam(Constants.UTM_CONTENT, query, 'utmcct', cookie);

  var utmData = {};
  var addIfNotNull = function addIfNotNull(key, value) {
    if (!utils.isEmptyString(value)) {
      utmData[key] = value;
    }
  };

  addIfNotNull(Constants.UTM_SOURCE, utmSource);
  addIfNotNull(Constants.UTM_MEDIUM, utmMedium);
  addIfNotNull(Constants.UTM_CAMPAIGN, utmCampaign);
  addIfNotNull(Constants.UTM_TERM, utmTerm);
  addIfNotNull(Constants.UTM_CONTENT, utmContent);

  return utmData;
};

export default getUtmData;
