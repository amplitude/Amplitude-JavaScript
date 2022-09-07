import Constants from './constants';
import language from './language';
import { AmplitudeServerZone } from './server-zone';
import { version as libraryVersion } from '../package.json';

/**
 * Options used when initializing Amplitude
 * @typedef {Object} Options
 * @property {string} [apiEndpoint=`api.amplitude.com`] - Endpoint to send amplitude event requests to.
 * @property {boolean} [batchEvents=`false`] -  If `true`, then events are batched together and uploaded only when the number of unsent events is greater than or equal to eventUploadThreshold or after eventUploadPeriodMillis milliseconds have passed since the first unsent event was logged.
 * @property {number} [cookieExpiration=`365`] - The number of days after which the Amplitude cookie will expire. 12 months is for GDPR compliance.
 * @property {string} [cookieName=`amplitude_id`] - *DEPRECATED*
 * @property {string} [sameSiteCookie='None'] -  Sets the SameSite flag on the amplitude cookie. Decides cookie privacy policy.
 * @property {boolean} [cookieForceUpgrade=`false`] - Forces pre-v6.0.0 instances to adopt post-v6.0.0 compat cookie formats.
 * @property {boolean} [deferInitialization=`null`] -  If `true`, disables the core functionality of the sdk, including saving a cookie and all logging, until explicitly enabled. To enable tracking, please call `amplitude.getInstance().enableTracking()` *Note: This will not affect users who already have an amplitude cookie. The decision to track events is determined by whether or not a user has an amplitude analytics cookie. If the `cookieExpiration</code> is manually defined to be a short lifespan, you may need to run `amplitude.getInstance().enableTracking()` upon the cookie expiring or upon logging in.*
 * @property {boolean} [disableCookies=`false`] -  Disable Ampllitude cookies altogether.
 * @property {string} [deviceId=A randomly generated UUID.] -  The custom Device ID to set. *Note: This is not recommended unless you know what you are doing (e.g. you have your own system for tracking user devices).*
 * @property {boolean} [deviceIdFromUrlParam=`false`] -  If `true`, then the SDK will parse Device ID values from the URL parameter amp_device_id if available. Device IDs defined in the configuration options during init will take priority over Device IDs from URL parameters.
 * @property {string} [domain=The top domain of the current page's URL. ('https://amplitude.com')] -  Set a custom domain for the Amplitude cookie. To include subdomains, add a preceding period, eg: `.amplitude.com`.
 * @property {number} [eventUploadPeriodMillis=`30000` (30 sec)] -  Amount of time in milliseconds that the SDK waits before uploading events if batchEvents is true.
 * @property {number} [eventUploadThreshold=`30`] -  Minimum number of events to batch together per request if batchEvents is true.
 * @property {boolean} [forceHttps=`true`] -  If `true`, the events will always be uploaded to HTTPS endpoint. Otherwise, it will use the embedding site's protocol.
 * @property {boolean} [includeFbclid=`false`] -  If `true`, captures the fbclid URL parameter as well as the user's initial_fbclid via a setOnce operation.
 * @property {boolean} [includeGclid=`false`] -  If `true`, captures the gclid URL parameter as well as the user's initial_gclid via a setOnce operation.
 * @property {boolean} [includeReferrer=`false`] -  If `true`, captures the referrer and referring_domain for each session, as well as the user's initial_referrer and initial_referring_domain via a setOnce operation.
 * @property {boolean} [includeUtm=`false`] -  If `true`, finds UTM parameters in the query string or the _utmz cookie, parses, and includes them as user properties on all events uploaded. This also captures initial UTM parameters for each session via a setOnce operation.
 * @property {Object} [ingestionMetadata] Ingestion metadata
 * @property {string} [ingestionMetadata.sourceName] source name in ingestion metadata, e.g. "ampli"
 * @property {string} [ingestionMetadata.sourceVersion] source version in ingestion metadata, e.g. "1.0.0"
 * @property {string} [language=The language determined by the browser] -  Custom language to set.
 * @property {Object} [library=`{ name: 'amplitude-js', version: packageJsonVersion }`] -  Values for the library version
 * @property {string} [logLevel=`WARN`] -  Level of logs to be printed in the developer console. Valid values are 'DISABLE', 'ERROR', 'WARN', 'INFO'. To learn more about the different options, see below.
 * @property {boolean} [logAttributionCapturedEvent=`false`] - If `true`, the SDK will log an Amplitude event anytime new attribution values are captured from the user. **Note: These events count towards your event volume.** Event name being logged: [Amplitude] Attribution Captured. Event Properties that can be logged: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `referring_domain`, `gclid`, `fbclid`. For UTM properties to be logged, `includeUtm` must be set to `true`. For the `referrer` and `referring_domain` properties to be logged, `includeReferrer` must be set to `true`. For the `gclid` property to be logged, `includeGclid` must be set to `true`. For the `fbclid` property to be logged, `includeFbclid` must be set to `true`.
 * @property {boolean} [optOut=`false`] -  Whether or not to disable tracking for the current user.
 * @property {function} [onError=`() => {}`] - Function to call on error.
 * @property {function} [onExitPage=`() => {}`] - Function called when the user exits the browser. Useful logging on page exit.
 * @property {Object} [plan] Tracking plan properties
 * @property {string} [plan.branch] The tracking plan branch name e.g. "main"
 * @property {string} [plan.source] The tracking plan source e.g. "web"
 * @property {string} [plan.version] The tracking plan version e.g. "1", "15"
 * @property {string} [plan.versionId] The tracking plan version Id e.g. "9ec23ba0-275f-468f-80d1-66b88bff9529"
 * @property {string} [platform=`Web`] -  Platform device is running on. Defaults to `Web` (browser, including mobile browsers).
 * @property {number} [savedMaxCount=`1000`] -  Maximum number of events to save in localStorage. If more events are logged while offline, then old events are removed.
 * @property {boolean} [saveEvents=`true`] -  If `true`, saves events to localStorage and removes them upon successful upload. *Note: Without saving events, events may be lost if the user navigates to another page before the events are uploaded.*
 * @property {boolean} [saveParamsReferrerOncePerSession=`true`] -  If `true`, then includeGclid, includeFbclid, includeReferrer, and includeUtm will only track their respective properties once per session. New values that come in during the middle of the user's session will be ignored. Set to false to always capture new values.
 * @property {boolean} [secureCookie=`false`] -  If `true`, the amplitude cookie will be set with the Secure flag.
 * @property {number} [sessionTimeout=`30*60*1000` (30 min)] -  The time between logged events before a new session starts in milliseconds.
 * @property {string[]} [storage=`''`] - Sets storage strategy.  Options are 'cookies', 'localStorage', 'sessionStorage', or `none`. Will override `disableCookies` option
 * @property {Object} [trackingOptions=`{ city: true, country: true, carrier: true, device_manufacturer: true, device_model: true, dma: true, ip_address: true, language: true, os_name: true, os_version: true, platform: true, region: true, version_name: true}`] - Type of data associated with a user.
 * @property {string} [transport=`http`] - Network transport mechanism used to send events. Options are 'http' and 'beacon'.
 * @property {boolean} [unsetParamsReferrerOnNewSession=`false`] -  If `false`, the existing `referrer` and `utm_parameter` values will be carried through each new session. If set to `true`, the `referrer` and `utm_parameter` user properties, which include `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content`, will be set to `null` upon instantiating a new session. Note: This only works if `includeReferrer` or `includeUtm` is set to `true`.
 * @property {string} [unsentKey=`amplitude_unsent`] - localStorage key that stores unsent events.
 * @property {string} [unsentIdentifyKey=`amplitude_unsent_identify`] - localStorage key that stores unsent identifies.
 * @property {number} [uploadBatchSize=`100`] -  The maximum number of events to send to the server per request.
 * @property {Object} [headers=`{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }`] - Headers attached to an event(s) upload network request. Custom header properties are merged with this object.
 * @property {string} [serverZone] - For server zone related configuration, used for server api endpoint and dynamic configuration.
 * @property {boolean} [useDynamicConfig] - Enable dynamic configuration to find best server url for user.
 * @property {boolean} [serverZoneBasedApi] - To update api endpoint with serverZone change or not. For data residency, recommend to enable it unless using own proxy server.
 * @property {number} [sessionId=`null`] - The custom Session ID for the current session. *Note: This is not recommended unless you know what you are doing because the Session ID of a session is utilized for all session metrics in Amplitude.
 * @property {string} [partnerId=`null`] - The partner id value
 */
export default {
  apiEndpoint: Constants.EVENT_LOG_URL,
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
  includeFbclid: false,
  includeGclid: false,
  includeReferrer: false,
  includeUtm: false,
  ingestionMetadata: {
    sourceName: '',
    sourceVersion: '',
  },
  language: language.getLanguage(),
  library: {
    name: 'amplitude-js',
    version: libraryVersion,
  },
  logLevel: 'WARN',
  logAttributionCapturedEvent: false,
  optOut: false,
  onError: () => {},
  onExitPage: () => {},
  onNewSessionStart: () => {},
  plan: {
    branch: '',
    source: '',
    version: '',
    versionId: '',
  },
  platform: 'Web',
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
  transport: Constants.TRANSPORT_HTTP,
  unsetParamsReferrerOnNewSession: false,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  },
  serverZone: AmplitudeServerZone.US,
  useDynamicConfig: false,
  serverZoneBasedApi: false,
  sessionId: null,
  partnerId: '',
};
