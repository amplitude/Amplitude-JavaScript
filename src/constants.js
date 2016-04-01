module.exports = {
  API_VERSION: 2,
  MAX_STRING_LENGTH: 1024,
  IDENTIFY_EVENT: '$identify',

  // localStorageKeys
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  LAST_IDENTIFY_ID: 'amplitude_lastIdentifyId',
  LAST_SEQUENCE_NUMBER: 'amplitude_lastSequenceNumber',
  REFERRER: 'amplitude_referrer',
  SESSION_ID: 'amplitude_sessionId',
  UTM_PROPERTIES: 'amplitude_utm_properties',

  // Used in cookie as well
  DEVICE_ID: 'amplitude_deviceId',
  OPT_OUT: 'amplitude_optOut',
  USER_ID: 'amplitude_userId'
};
