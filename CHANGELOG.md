### 4.5.2 (November 10, 2018)

* Bugfix: Default groupProperties to empty object in logEvent.

### 4.5.1 (November 7, 2018)

* Fix error that might occur if another party defines a global variable named `Buffer` that is not actually a `Buffer`.

* Fix bug where the log level was not initialized correctly

### 4.5.0 (October 24, 2018)

* Add support for groupIdentify calls

### 4.4.0 (July 25, 2018)

* Added `trackingOptions` as a configuration option. This allows you to disable the automatic tracking of specific user properties such as ip_address, city, country, etc. See the [Help Center Documentation](https://amplitude.zendesk.com/hc/en-us/articles/115001361248#settings-configuration-options) for instructions on setting up th is configuration.

### 4.3.0 (July 16, 2018)

* Add more context to the 'No request sent' responses

### 4.2.1 (April 19, 2018)

* Add `resetSessionId` method that sets the sessionId to the current time.

### 4.1.1 (March 22, 2018)

* Fix bug where cookie data such as device id from older releases were not migrated

### 4.1.0 (January 18, 2018)

* Allow for numeric user ids

* Namespace local storage with api key to prevent cross domain contamination

### 4.0.0 (November 20, 2017)

* Default `forceHttps` option to `true`.

### 3.8.0 (October 27, 2017)

* Add `logLevel` config option

### 3.7.0 (September 14, 2017)

* Add `setSessionId(sesionId)` method. Note this is not recommended unless you know what are you doing.
* Added support for Bower. Install using `bower install amplitude-js`.
* Switched from webpack to Rollup for building the SDK.

### 3.6.0 (September 13, 2017)

* Supports clean NPM module loading eg: `const amplitude = require('amplitude');` or `import 'amplitude' from 'amplitude-js';`
* SDK is now a proper UMD module. Supports RequireJS with r.js builds now.
* Updated build process to use webpack

### 3.4.1 (June 29, 2017)
* Handle SDK loading errors in the load snippet. Please update the load snippets on your website to [the latest version](https://amplitude.zendesk.com/hc/en-us/articles/115001361248-JavaScript-SDK-Installation#installation).
* Migrating setup instructions and SDK documentation in the README file to Zendesk articles.

### 3.4.0 (November 8, 2016)

* Add `logEventWithTimestamp` to allow logging events with a custom timestamp. The timestamp should a number representing the time in milliseconds since epoch. See [documentation](https://rawgit.com/amplitude/Amplitude-Javascript/master/documentation/AmplitudeClient.html) for more details.
* Add configuration option `deviceIdFromUrlParam`, which when set to `true` will have the SDK parse device IDs from url parameter `amp_device_id` if available. Device IDs defined in the configuration options during init will take priority over device IDs from url parameters.

### 3.3.2 (October 28, 2016)

* Updated our [UA-parser-js](https://github.com/amplitude/ua-parser-js) fork to properly parse the version number for Chrome Mobile browsers.

### 3.3.1 (October 26, 2016)

* Fix bug where tracking UTM params and referrer drops unsent events that have been saved to localStorage.

### 3.3.0 (October 19, 2016)

* Add option to track GCLID (Google Click ID) as a user property (set `includeGclid` to `true` in the SDK configuration).
* Add option to track new UTM parameters, referrer, and GCLID values during the same session. By default the SDK only saves the values once at the start of the session. You can remove this restriction by setting `saveParamsReferrerOncePerSession` to `false` in the SDK configuration. See the [Readme](https://github.com/amplitude/Amplitude-Javascript#tracking-utm-parameters-referrer-and-gclid) for more information.

### 3.2.0 (October 7, 2016)

* Block event property and user property dictionaries that have more than 1000 items. This is to block properties that are set unintentionally (for example in a loop). A single call to `logEvent` should not have more than 1000 event properties. Similarly a single call to `setUserProperties` should not have more than 1000 user properties.

### 3.1.0 (September 14, 2016)

* Add configuration option `forceHttps`, which when set to `true` forces the SDK to always upload to HTTPS endpoint. By default the SDK uses the endpoint that matches the embedding site's protocol (for example if your site is HTTP, it will use the HTTP endpoint).

### 3.0.2 (July 6, 2016)

* `productId` is no longer a required field for `Revenue` logged via `logRevenueV2`.
* Track raw user agent string for backend filtering.

### 3.0.1 (June 22, 2016)

* Update README with link to our [Google Tag Manager integration demo app](https://github.com/amplitude/GTM-Web-Demo).
* Fix bug where referrer and UTM params were being captured more than once per session.

### 3.0.0 (May 27, 2016)

* Add support for logging events to multiple Amplitude apps. **Note this is a major update, and may break backwards compatability.** See [Readme](https://amplitude.zendesk.com/hc/en-us/articles/115001361248-JavaScript-SDK-Installation#backwards-compatibility) for details.
* Init callback now passes the Amplitude instance as an argument to the callback function.

### 2.13.0 (May 26, 2016)

* Update our fork of [UAParser.js](https://github.com/faisalman/ua-parser-js) from v0.7.7 to v0.7.10. This will improve the resolution of user agent strings to device and OS information.

### 2.12.1 (April 21, 2016)

* Silence console warnings for various UTM property keys with undefined values.

### 2.12.0 (April 20, 2016)

* Add support for setting groups for users and events. See the [Readme](https://github.com/amplitude/Amplitude-Javascript#setting-groups) for more information.
* Add `logRevenueV2` and new `Revenue` class to support logging revenue events with properties, and revenue type. See [Readme](https://github.com/amplitude/Amplitude-Javascript#tracking-revenue) for more info.
* Add helper method to regenerate a new random deviceId. This can be used to anonymize a user after they log out. Note this is not recommended unless you know what are you doing. See [Readme](https://github.com/amplitude/Amplitude-Javascript#logging-out-and-anonymous-users) for more information.

### 2.11.0 (April 14, 2016)

* Add tracking of each user's initial_utm parameters (which is captured as a set once operation). Utm parameters are now sent only once per user session.
* Add documentation for SDK functions. You can take a look [here](https://rawgit.com/amplitude/Amplitude-Javascript/master/documentation/Amplitude.html). A link has also been added to the Readme.
* Fix cookie test bug. In rare cases, the cookie test failed to delete the key used in testing. Reloading the page generated new keys, filling up the cookie over time. Fixed test to re-use the same key.

### 2.10.0 (March 30, 2016)

* Identify function now accepts a callback function as an argument. The callback will be run after the identify event is sent.
* Add support for `prepend` user property operation. This allows you to insert value(s) at the front of a list. See [Readme](https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations) for more details.
* Keep sessions and event metadata in-sync across multiple windows/tabs.

### 2.9.1 (March 6, 2016)

* Fix bug where saveReferrer throws exception if sessionStorage is disabled.
* Log messages with a try/catch to support IE 8.
* Validate event properties during logEvent and initialization before sending request.
* Add instructions for proper integration with RequireJS.

## 2.9.0 (January 15, 2016)

* Add ability to clear all user properties.

## 2.8.0 (December 15, 2015)

* Add getSessionId helper method to fetch the current sessionId.
* Add support for append user property operation.
* Add tracking of each user's initial_referrer property (which is captured as a set once operation). Referrer property captured once per user session.

## 2.7.0 (December 1, 2015)

* If cookies are disabled by user, then fallback to localstorage to save the cookie data.
* Migrate sessionId, lastEventTime, eventId, identifyId, and sequenceNumber to cookie storage to support sessions across different subdomains.

## 2.6.2 (November 17, 2015)

* Fix bug where response code is not passed to XDomainRequest callback (affects IE versions 10 and lower).

## 2.6.1 (November 6, 2015)

* Localstorage is not persisted across subdomains, reverting cookie data migration and adding a reverse migration path for users already on 2.6.0.

## 2.6.0 (November 2, 2015) - DEPRECATED

* Migrate cookie data to local storage to address issue where having cookies disabled causes SDK to generate a new deviceId for returning users. - DEPRECATED

## 2.5.0 (September 30, 2015)

* Add support for user properties operations (set, setOnce, add, unset).
* Fix bug to run queued functions after script element is loaded and set to window.

## 2.4.1 (September 21, 2015)

* Add support for passing callback function to init.
* Fix bug to check that Window localStorage is available for use.
* Fix bug to prevent scheduling multiple event uploads.

## 2.4.0 (September 4, 2015)

* Add support for passing callback functions to logEvent.

## 2.3.0 (September 2, 2015)

* Add option to batch events into a single request.

## 2.2.1 (Aug 13, 2015)

* Fix bug where multi-byte unicode characters were hashed improperly.
* Add option to send referrer information as user properties.

## 2.2.0 (May 5, 2015)

* Use gzipped version of the library by default. If you still need the uncompressed version, remove ".gz" from the script url in your integration snippet.
* Upgrade user agent parser for browser detection to keep up-to-date with browser updates.
* Fix bug where Android browsers were reported as Safari on Linux.
* Fix bug with line endings in UTF-8 encoder that was causing issues with checksums.

## 2.1.0 (March 23, 2015)

* Add support for logging revenue data.
* Add opt out setting to disable logging for a user.

## 2.0.4 (March 2, 2015)

* Add option to gather UTM parameters and send them as event properties
* Add support for detecting new sessions

## 2.0.3 (January 22, 2015)

* Add language detection

## 2.0.2 (January 2, 2015)

* Fix detect.js for AMD compatibility

## 2.0.1 (December 19, 2014)

* Fix bug where session ids weren't stored when a session timed out
* Add setDeviceId method

## 2.0.0 (November 7, 2014)

* Fix iPad detection in user agent
* Calls to setUserProperties now merge new properties instead of replacing
* Fix bugs in cookies. Add reverse compatibility
* Incorporate browser/device detection

## 1.3.0 (September 11, 2014)

* Fix null/undefined error when missing config
* Add session tracking
* Add overrideable device id
* Fix error where events were not getting removed from local storage
* UTF-8 encode strings before MD5 hashing

## 1.2.0 (June 11, 2014)

* Update to version 2 of data collection API.
* Send client upload time and checksum
* Rename setGlobalUserProperties to setUserProperties

## 1.1.0 (April 17, 2014)

* Added ability to specifiy domain with cookies using setDomain method
* Fixed Base64 encode method if window doesn't have bota method
* Added try/catch around all public methods
* Added Internet Explorer compatibility for JSON, toString.call and Ajax request
* Add saveEvents configuration option
* Use native Base64 encoding when available
* Remove LZW/Base64 encoding from saving to localStorage to reduce latency
* Save user id and global user properties to cookie
* Save global user properties, change sdk url to https

## 1.0.0 (January 14, 2013)

* Initial release
* Add setVersionName function
* Default global properties to empty array
