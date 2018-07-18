import language from './language';

// default options
export default {
  apiEndpoint: 'api.amplitude.com',
  batchEvents: false,
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  deviceIdFromUrlParam: false,
  domain: '',
  eventUploadPeriodMillis: 30 * 1000, // 30s
  eventUploadThreshold: 30,
  forceHttps: true,
  includeGclid: false,
  includeReferrer: false,
  includeUtm: false,
  language: language.language,
  logLevel: 'WARN',
  optOut: false,
  platform: 'Web',
  savedMaxCount: 1000,
  saveEvents: true,
  saveParamsReferrerOncePerSession: true,
  sessionTimeout: 30 * 60 * 1000,
  trackingOptions: {
    city: true,
    country: true,
    device_model: true,
    dma: true,
    ip_address: true,
    language: true,
    os_name: true,
    os_version: true,
    platform: true,
    region: true,
    version_name: true
  },
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100,
};
