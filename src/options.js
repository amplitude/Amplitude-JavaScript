import language from './language';

// default options
export default {
  apiEndpoint: 'api.amplitude.com',
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  domain: '',
  includeReferrer: false,
  includeUtm: false,
  language: language.language,
  logLevel: 'WARN',
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
  eventUploadPeriodMillis: 30 * 1000, // 30s
  forceHttps: false,
  includeGclid: false,
  saveParamsReferrerOncePerSession: true,
  deviceIdFromUrlParam: false,
};
