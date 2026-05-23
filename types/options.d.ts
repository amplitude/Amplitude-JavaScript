declare namespace _default {
    export const apiEndpoint: string;
    export const batchEvents: boolean;
    export const cookieExpiration: number;
    export const cookieName: string;
    export const sameSiteCookie: string;
    export const cookieForceUpgrade: boolean;
    export const deferInitialization: boolean;
    export const disableCookies: boolean;
    export const deviceIdFromUrlParam: boolean;
    export const domain: string;
    export const eventUploadPeriodMillis: number;
    export const eventUploadThreshold: number;
    export const forceHttps: boolean;
    export const includeFbclid: boolean;
    export const includeGclid: boolean;
    export const includeReferrer: boolean;
    export const includeUtm: boolean;
    export const language: any;
    export const logLevel: string;
    export const logAttributionCapturedEvent: boolean;
    export const optOut: boolean;
    export function onError(): void;
    export { platform };
    export const savedMaxCount: number;
    export const saveEvents: boolean;
    export const saveParamsReferrerOncePerSession: boolean;
    export const secureCookie: boolean;
    export const sessionTimeout: number;
    export const storage: string;
    export namespace trackingOptions {
        export const city: boolean;
        export const country: boolean;
        export const carrier: boolean;
        export const device_manufacturer: boolean;
        export const device_model: boolean;
        export const dma: boolean;
        export const ip_address: boolean;
        const language_1: boolean;
        export { language_1 as language };
        export const os_name: boolean;
        export const os_version: boolean;
        const platform_1: boolean;
        export { platform_1 as platform };
        export const region: boolean;
        export const version_name: boolean;
    }
    export const unsetParamsReferrerOnNewSession: boolean;
    export const unsentKey: string;
    export const unsentIdentifyKey: string;
    export const uploadBatchSize: number;
}
export default _default;
/**
 * Options used when initializing Amplitude
 */
export type Options = {
    /**
     * - Endpoint to send amplitude event requests to.
     */
    apiEndpoint?: string;
    /**
     * -  If `true`, then events are batched together and uploaded only when the number of unsent events is greater than or equal to eventUploadThreshold or after eventUploadPeriodMillis milliseconds have passed since the first unsent event was logged.
     */
    batchEvents?: boolean;
    /**
     * - The number of days after which the Amplitude cookie will expire. 12 months is for GDPR compliance.
     */
    cookieExpiration?: number;
    /**
     * - *DEPRECATED*
     */
    cookieName?: string;
    /**
     * -  Sets the SameSite flag on the amplitude cookie. Decides cookie privacy policy.
     */
    sameSiteCookie?: string;
    /**
     * - Forces pre-v6.0.0 instances to adopt post-v6.0.0 compat cookie formats.
     */
    cookieForceUpgrade?: boolean;
    /**
     * -  If `true`, disables the core functionality of the sdk, including saving a cookie and all logging, until explicitly enabled. To enable tracking, please call `amplitude.getInstance().enableTracking()` *Note: This will not affect users who already have an amplitude cookie. The decision to track events is determined by whether or not a user has an amplitude analytics cookie. If the `cookieExpiration</code> is manually defined to be a short lifespan, you may need to run `amplitude.getInstance().enableTracking()` upon the cookie expiring or upon logging in.*
     */
    deferInitialization?: boolean;
    /**
     * -  Disable Ampllitude cookies altogether.
     */
    disableCookies?: boolean;
    /**
     * randomly generated UUID.] -  The custom Device ID to set. *Note: This is not recommended unless you know what you are doing (e.g. you have your own system for tracking user devices).*
     */
    deviceId?: string;
    /**
     * -  If `true`, then the SDK will parse Device ID values from the URL parameter amp_device_id if available. Device IDs defined in the configuration options during init will take priority over Device IDs from URL parameters.
     */
    deviceIdFromUrlParam?: boolean;
    /**
     * top domain of the current page's URL. ('https://amplitude.com')] -  Set a custom domain for the Amplitude cookie. To include subdomains, add a preceding period, eg: `.amplitude.com`.
     */
    domain?: string;
    /**
     * -  Amount of time in milliseconds that the SDK waits before uploading events if batchEvents is true.
     */
    eventUploadPeriodMillis?: number;
    /**
     * -  Minimum number of events to batch together per request if batchEvents is true.
     */
    eventUploadThreshold?: number;
    /**
     * -  If `true`, the events will always be uploaded to HTTPS endpoint. Otherwise, it will use the embedding site's protocol.
     */
    forceHttps?: boolean;
    /**
     * -  If `true`, captures the fbclid URL parameter as well as the user's initial_fbclid via a setOnce operation.
     */
    includeFbclid?: boolean;
    /**
     * -  If `true`, captures the gclid URL parameter as well as the user's initial_gclid via a setOnce operation.
     */
    includeGclid?: boolean;
    /**
     * -  If `true`, captures the referrer and referring_domain for each session, as well as the user's initial_referrer and initial_referring_domain via a setOnce operation.
     */
    includeReferrer?: boolean;
    /**
     * -  If `true`, finds UTM parameters in the query string or the _utmz cookie, parses, and includes them as user properties on all events uploaded. This also captures initial UTM parameters for each session via a setOnce operation.
     */
    includeUtm?: boolean;
    /**
     * language determined by the browser] -  Custom language to set.
     */
    language?: string;
    /**
     * -  Level of logs to be printed in the developer console. Valid values are 'DISABLE', 'ERROR', 'WARN', 'INFO'. To learn more about the different options, see below.
     */
    logLevel?: string;
    /**
     * - If `true`, the SDK will log an Amplitude event anytime new attribution values are captured from the user. **Note: These events count towards your event volume.** Event name being logged: [Amplitude] Attribution Captured. Event Properties that can be logged: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `referring_domain`, `gclid`, `fbclid`. For UTM properties to be logged, `includeUtm` must be set to `true`. For the `referrer` and `referring_domain` properties to be logged, `includeReferrer` must be set to `true`. For the `gclid` property to be logged, `includeGclid` must be set to `true`. For the `fbclid` property to be logged, `includeFbclid` must be set to `true`.
     */
    logAttributionCapturedEvent?: boolean;
    /**
     * -  Whether or not to disable tracking for the current user.
     */
    optOut?: boolean;
    /**
     * - Function to call on error.
     */
    onError?: Function;
    /**
     * -  Platform device is running on. `Web` is a browser (including mobile browsers). `iOS` and `Android` are relevant only for react-native apps.
     */
    platform?: string;
    /**
     * -  Maximum number of events to save in localStorage. If more events are logged while offline, then old events are removed.
     */
    savedMaxCount?: number;
    /**
     * -  If `true`, saves events to localStorage and removes them upon successful upload. *Note: Without saving events, events may be lost if the user navigates to another page before the events are uploaded.*
     */
    saveEvents?: boolean;
    /**
     * -  If `true`, then includeGclid, includeFbclid, includeReferrer, and includeUtm will only track their respective properties once per session. New values that come in during the middle of the user's session will be ignored. Set to false to always capture new values.
     */
    saveParamsReferrerOncePerSession?: boolean;
    /**
     * -  If `true`, the amplitude cookie will be set with the Secure flag.
     */
    secureCookie?: boolean;
    /**
     * -  The time between logged events before a new session starts in milliseconds.
     */
    sessionTimeout?: number;
    /**
     * - Sets storage strategy.  Options are 'cookies', 'localStorage', 'sessionStorage', or `none`. Will override `disableCookies` option
     */
    storage?: string[];
    /**
     * - Type of data associated with a user.
     */
    trackingOptions?: any;
    /**
     * -  If `false`, the existing `referrer` and `utm_parameter` values will be carried through each new session. If set to `true`, the `referrer` and `utm_parameter` user properties, which include `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content`, will be set to `null` upon instantiating a new session. Note: This only works if `includeReferrer` or `includeUtm` is set to `true`.
     */
    unsetParamsReferrerOnNewSession?: boolean;
    /**
     * - localStorage key that stores unsent events.
     */
    unsentKey?: string;
    /**
     * - localStorage key that stores unsent identifies.
     */
    unsentIdentifyKey?: string;
    /**
     * -  The maximum number of events to send to the server per request.
     */
    uploadBatchSize?: number;
};
declare let platform: string;
