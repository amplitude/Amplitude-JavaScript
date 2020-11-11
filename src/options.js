import Constants from './constants';
import language from './language';

let platform = 'Web';

if (BUILD_COMPAT_REACT_NATIVE) {
  const { Platform } = require('react-native');
  if (Platform.OS === 'ios') {
    platform = 'iOS';
  } else if (Platform.OS === 'android') {
    platform = 'Android';
  }
}

export default {
  apiEndpoint: 'api.amplitude.com',
  batchEvents: false,
  cookieExpiration: 365, // 12 months is for GDPR compliance
  cookieName: 'amplitude_id', // this is a deprecated option
  sameSiteCookie: 'Lax', // cookie privacy policy
  cookieForceUpgrade: false,
  deferInitialization: false,
  disableCookies: false, // this is a deprecated option
  deviceIdFromUrlParam: false,
  domain: '',
  eventUploadPeriodMillis: 30 * 1000, // 30s
  eventUploadThreshold: 30,
  forceHttps: true,
  includeGclid: false,
  includeReferrer: false,
  includeUtm: false,
  language: language.getLanguage(),
  logLevel: 'WARN',
  logAttributionCapturedEvent: false,
  optOut: false,
  onError: () => {},
  platform,
  savedMaxCount: 1000,
  saveEvents: true,
  saveParamsReferrerOncePerSession: true,
  secureCookie: false,
  sessionTimeout: 30 * 60 * 1000,
  storage: Constants.STORAGE_DEFAULT,
  trackingOptions: {
    city: true,
    country: true,
    carrier: true,
    device_manufacturer: true,
    device_model: true,
    dma: true,
    ip_address: true,
    language: true,
    os_name: true,
    os_version: true,
    platform: true,
    region: true,
    version_name: true,
  },
  unsetParamsReferrerOnNewSession: false,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100,
};
