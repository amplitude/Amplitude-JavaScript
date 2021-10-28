import Constants from './constants';

/**
 * AmplitudeServerZone is for Data Residency and handling server zone related properties.
 * The server zones now are US and EU.
 *
 * For usage like sending data to Amplitude's EU servers, you need to configure the serverZone during nitializing.
 */
const AmplitudeServerZone = {
  US: 'US',
  EU: 'EU',
};

const getEventLogApi = (serverZone) => {
  let eventLogUrl = Constants.EVENT_LOG_URL;
  switch (serverZone) {
    case AmplitudeServerZone.EU:
      eventLogUrl = Constants.EVENT_LOG_EU_URL;
      break;
    case AmplitudeServerZone.US:
      eventLogUrl = Constants.EVENT_LOG_URL;
      break;
    default:
      break;
  }
  return eventLogUrl;
};

const getDynamicConfigApi = (serverZone) => {
  let dynamicConfigUrl = Constants.DYNAMIC_CONFIG_URL;
  switch (serverZone) {
    case AmplitudeServerZone.EU:
      dynamicConfigUrl = Constants.DYNAMIC_CONFIG_EU_URL;
      break;
    case AmplitudeServerZone.US:
      dynamicConfigUrl = Constants.DYNAMIC_CONFIG_URL;
      break;
    default:
      break;
  }
  return dynamicConfigUrl;
};

export { AmplitudeServerZone, getEventLogApi, getDynamicConfigApi };
