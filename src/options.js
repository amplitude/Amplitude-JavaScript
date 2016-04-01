var language = require('./language');

// default options
module.exports = {
  apiEndpoint: 'api.amplitude.com',
  batchEvents: false,
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  domain: '',
  eventUploadPeriodMillis: 30 * 1000, // 30s
  eventUploadThreshold: 30,
  includeReferrer: false,
  includeUtm: false,
  language: language.language,
  optOut: false,
  platform: 'Web',
  savedMaxCount: 1000,
  saveEvents: true,
  sessionTimeout: 30 * 60 * 1000,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100
};
