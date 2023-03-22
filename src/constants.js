export default {
  DEFAULT_INSTANCE: '$default_instance',
  API_VERSION: 2,
  MAX_STRING_LENGTH: 4096,
  MAX_PROPERTY_KEYS: 1000,
  IDENTIFY_EVENT: '$identify',
  GROUP_IDENTIFY_EVENT: '$groupidentify',
  EVENT_LOG_URL: 'api.amplitude.com',
  EVENT_LOG_EU_URL: 'api.eu.amplitude.com',
  DYNAMIC_CONFIG_URL: 'regionconfig.amplitude.com',
  DYNAMIC_CONFIG_EU_URL: 'regionconfig.eu.amplitude.com',

  // localStorageKeys
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  LAST_IDENTIFY_ID: 'amplitude_lastIdentifyId',
  LAST_SEQUENCE_NUMBER: 'amplitude_lastSequenceNumber',
  SESSION_ID: 'amplitude_sessionId',

  // Used in cookie as well
  DEVICE_ID: 'amplitude_deviceId',
  OPT_OUT: 'amplitude_optOut',
  USER_ID: 'amplitude_userId',

  // indexes of properties in cookie v2 storage format
  DEVICE_ID_INDEX: 0,
  USER_ID_INDEX: 1,
  OPT_OUT_INDEX: 2,
  SESSION_ID_INDEX: 3,
  LAST_EVENT_TIME_INDEX: 4,
  EVENT_ID_INDEX: 5,
  IDENTIFY_ID_INDEX: 6,
  SEQUENCE_NUMBER_INDEX: 7,

  COOKIE_TEST_PREFIX: 'amp_cookie_test',
  COOKIE_PREFIX: 'amp',

  // Storage options
  STORAGE_DEFAULT: '',
  STORAGE_COOKIES: 'cookies',
  STORAGE_NONE: 'none',
  STORAGE_LOCAL: 'localStorage',
  STORAGE_SESSION: 'sessionStorage',

  // revenue keys
  REVENUE_EVENT: 'revenue_amount',
  REVENUE_PRODUCT_ID: '$productId',
  REVENUE_QUANTITY: '$quantity',
  REVENUE_PRICE: '$price',
  REVENUE_REVENUE_TYPE: '$revenueType',

  AMP_DEVICE_ID_PARAM: 'amp_device_id', // url param
  AMP_REFERRER_PARAM: 'amp_referrer', // url param for overwriting the document.refer

  REFERRER: 'referrer',
  REFERRING_DOMAIN: 'referring_domain',

  // UTM Params
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content',

  ATTRIBUTION_EVENT: '[Amplitude] Attribution Captured',

  TRANSPORT_HTTP: 'http',
  TRANSPORT_BEACON: 'beacon',
};
