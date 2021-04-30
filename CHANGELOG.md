## [8.2.1](https://github.com/amplitude/amplitude-javascript/compare/v8.2.0...v8.2.1) (2021-04-30)


### Bug Fixes

*  Cleanup test cookies ([#381](https://github.com/amplitude/amplitude-javascript/issues/381)) ([9d8ecc3](https://github.com/amplitude/amplitude-javascript/commit/9d8ecc38dafb1a996f0742eb992703517d2a6abd))

# [8.2.0](https://github.com/amplitude/amplitude-javascript/compare/v8.1.0...v8.2.0) (2021-04-28)


### Features

* Add HTTP header configurations to options ([#379](https://github.com/amplitude/amplitude-javascript/issues/379)) ([4aaa26f](https://github.com/amplitude/amplitude-javascript/commit/4aaa26f45919c5587bcc3fb21510ca8afbc41e4b))

# [8.1.0](https://github.com/amplitude/amplitude-javascript/compare/v8.0.0...v8.1.0) (2021-03-19)


### Features

* **identify:** add preInsert, postInsert, remove to Identify and gro… ([#372](https://github.com/amplitude/amplitude-javascript/issues/372)) ([7e9e992](https://github.com/amplitude/amplitude-javascript/commit/7e9e9929f5534c9285aad782aa7ded2b2f839f47))

# [8.0.0](https://github.com/amplitude/amplitude-javascript/compare/v7.4.4...v8.0.0) (2021-03-15)

### Bug Fixes

Removed support for React Native. We recently released an entirely new SDK focused entirely on React Native support, this can be found at https://github.com/amplitude/Amplitude-ReactNative. We will be writing a migration guide for users looking to move to the new React Native SDK.

* call onError in init function ([#368](https://github.com/amplitude/amplitude-javascript/issues/368)) ([d2ae868](https://github.com/amplitude/amplitude-javascript/commit/d2ae8686752d4a977213f1c0b9e2fe61ba24863c))
* remove callback from argument to function that takes no arguments ([#370](https://github.com/amplitude/amplitude-javascript/issues/370)) ([777dead](https://github.com/amplitude/amplitude-javascript/commit/777dead4a5051e8d4d7e990aeb365b8d868e9383))

## [7.4.4](https://github.com/amplitude/amplitude-javascript/compare/v7.4.3...v7.4.4) (2021-03-02)


### Bug Fixes

* remove only test and small robustness regression ([#357](https://github.com/amplitude/amplitude-javascript/issues/357)) ([9f7b036](https://github.com/amplitude/amplitude-javascript/commit/9f7b036aacd2e8e5ed4b27d2744c23c9e00b899e))

## [7.4.3](https://github.com/amplitude/amplitude-javascript/compare/v7.4.2...v7.4.3) (2021-02-24)


### Bug Fixes

* Uncaught session storage security error handling ([#358](https://github.com/amplitude/amplitude-javascript/issues/358)) ([560bb05](https://github.com/amplitude/amplitude-javascript/commit/560bb057742f7af17d3e09d0555e72d7b11e0a19))

## [7.4.2](https://github.com/amplitude/amplitude-javascript/compare/v7.4.1...v7.4.2) (2021-02-11)


### Bug Fixes

* **lint:** Do not directly call object builtins  ([#344](https://github.com/amplitude/amplitude-javascript/issues/344)) ([14fc693](https://github.com/amplitude/amplitude-javascript/commit/14fc693d56ff59a2a82b0eeadc4e7e6d3104026b))

## [7.4.1](https://github.com/amplitude/amplitude-javascript/compare/v7.4.0...v7.4.1) (2021-01-11)


### Bug Fixes

* Bug with logEvent callbacks not being called when unsent events are dropped  ([#342](https://github.com/amplitude/amplitude-javascript/issues/342)) ([f243a92](https://github.com/amplitude/amplitude-javascript/commit/f243a922bf05e99e1b178d4fa5265644fc974ad2)), closes [#142](https://github.com/amplitude/amplitude-javascript/issues/142)

# [7.4.0](https://github.com/amplitude/amplitude-javascript/compare/v7.3.3...v7.4.0) (2021-01-06)


### Features

* **privacy:** Add `storage` option ([#320](https://github.com/amplitude/amplitude-javascript/issues/320)) ([1a56a9b](https://github.com/amplitude/amplitude-javascript/commit/1a56a9b95827d90074f0421baa6901f6a7a1035b)), closes [#317](https://github.com/amplitude/amplitude-javascript/issues/317)
* Added Fbclid config option ([#338](https://github.com/amplitude/amplitude-javascript/issues/338)) ([f52288a](https://github.com/amplitude/amplitude-javascript/commit/f52288a82a9d07350712a84d83180f77295417ff))

## [7.3.3](https://github.com/amplitude/amplitude-javascript/compare/v7.3.2...v7.3.3) (2020-11-12)


### Bug Fixes

* **validation:** Be able to take in and validate null object event/user properties ([1ed41a3](https://github.com/amplitude/amplitude-javascript/commit/1ed41a3d7713c3930db0d1bffb54f9d8693b46b5))

## [7.3.2](https://github.com/amplitude/amplitude-javascript/compare/v7.3.1...v7.3.2) (2020-11-05)


### Bug Fixes

* **cookies:** reduce cookie lifetime ([#306](https://github.com/amplitude/amplitude-javascript/issues/306)) ([84e1a57](https://github.com/amplitude/amplitude-javascript/commit/84e1a5745fbd330fe0b9dba6331e9fbaba5c7015))
* Prototype js fix ([#313](https://github.com/amplitude/amplitude-javascript/issues/313)) ([7e463ab](https://github.com/amplitude/amplitude-javascript/commit/7e463ab3bb5510ce0cf4d0e4edbe0346029488d7))

## [7.3.1](https://github.com/amplitude/amplitude-javascript/compare/v7.3.0...v7.3.1) (2020-10-30)


### Bug Fixes

* **react-native:** Change @react-native-community/async-storage to @react-native-async-storage/async-storage ([#314](https://github.com/amplitude/amplitude-javascript/issues/314)) ([382c5a4](https://github.com/amplitude/amplitude-javascript/commit/382c5a4e508e2ad46a30380ed2e58ee83e696bd4))

# [7.3.0](https://github.com/amplitude/amplitude-javascript/compare/v7.2.2...v7.3.0) (2020-10-15)


### Features

* make oninit public ([#307](https://github.com/amplitude/amplitude-javascript/issues/307)) ([51d5d43](https://github.com/amplitude/amplitude-javascript/commit/51d5d4345b2a66c827c1e051e2b77a435fba0609))

## [7.2.2](https://github.com/amplitude/amplitude-javascript/compare/v7.2.1...v7.2.2) (2020-09-25)


### Bug Fixes

* Unavailable deviceId fallbacks ([#303](https://github.com/amplitude/amplitude-javascript/issues/303)) ([e0d39fd](https://github.com/amplitude/amplitude-javascript/commit/e0d39fdd6ce8e72a3a490ca16b3c1561d0d16513)), closes [#302](https://github.com/amplitude/amplitude-javascript/issues/302)

## [7.2.1](https://github.com/amplitude/amplitude-javascript/compare/v7.2.0...v7.2.1) (2020-09-22)


### Bug Fixes

* **initialization:** always return `this` in onInit ([#300](https://github.com/amplitude/amplitude-javascript/issues/300)) ([44d00d7](https://github.com/amplitude/amplitude-javascript/commit/44d00d7a7f18df19e07107615c2ed7a619b0063c))
* move bad postinstall script ([#301](https://github.com/amplitude/amplitude-javascript/issues/301)) ([ca98af3](https://github.com/amplitude/amplitude-javascript/commit/ca98af3cb7ded59fa35195b7fb1c3edf091d0449))

# [7.2.0](https://github.com/amplitude/amplitude-javascript/compare/v7.1.1...v7.2.0) (2020-09-22)


### Bug Fixes

* **cookies:** respect the options passed into cookies when testing to see if they're enabled ([#294](https://github.com/amplitude/amplitude-javascript/issues/294)) ([61b6590](https://github.com/amplitude/amplitude-javascript/commit/61b6590593238a5f251cbf5aa16233fdd3954802))

### Features

* add logAttributionCapturedEvent option ([#295](https://github.com/amplitude/amplitude-javascript/issues/295)) ([309dac3](https://github.com/amplitude/amplitude-javascript/commit/309dac3873e3404d4e52ba9b6958ab3e194b07b1

### 7.1.1 (August 26, 2020)
* Fix an issue with detection of whether or not cookies are enabled on a device

### 7.1.0 (Jun 28, 2020)
* Sync with upstream ua-parser to detect more browsers and devices
* Fix race condition where the SDK might write to the wrong cookie domain
* Fix race condition where the SDK might think cookies are disabled
* Revert `Device Type` field change from version 5.10.0 to show OS name again.
* Default SameSite cookie setting to Lax

#### Breaking Changes
* The SDK cookie now defaults to SameSite=Lax
* Windows Phone, IE Mobile, and Opera Mobile devices will be reported to amplitude slightly different. They will appear as "Windows Phone OS", "IEMobile", and "Opera Mobile" respectively.
* The device type field has gone back to showing OS name.

### 6.2.0 (May 1, 2020)
* Invoke the logEvent callbacks when a request is actually sent or when we give up on sending a request.
* Pass the initialized amplitude instance to the `onInit` callback.
* Fix language validation issue that occured when language was undefined.

### 6.1.0 (April 23, 2020)
* Use a more compact format for newly generated device IDs
* Fix issue with react native failing to initialize metadatastorage

### 6.0.1 (April 17, 2020)
* Fix issue where the UMD module did not build.

### 6.0.0 (April 17, 2020)
* Use a more compact cookie format
* Fix issue where a cookie key could have a space appear inside of it
* Allow for localStorage fallback with the `disableCookie` option.
* Only new and unseen devices will get the compact cookie. `cookieForceUpgrade` will force all browsers to upgrade and delete the old cookie.

#### Breaking Changes
* The cookie format has been changed to be more compact. If you use the same Amplitude project(API key) across multiple applications, and you track anonymous users across those applications, you will want to update amplitude across all those applications at the same time.

### 5.12.0 (April 12, 2020)
* Use an IIFE build for the snippet. This will solve issues where the snippet wouldn't load for require js users.

### 5.11.0 (April 6, 2020)
* Add a `sameSiteCookie` option to set the SameSite cookie. It is set to `None` by default

### 5.10.0 (March 10, 2020)
* `Library` field for event will include `amplitude-react-native` when using SDK in react native.
* `Device Type` field now will show the actual device model instead of OS name.

### 5.9.0 (February 3, 2020)
* Add default versionName to for react-native

### 5.8.0 (December 6, 2019)
* Add support to defer saving an amplitude cookie and logging events until a user has opted in

### 5.7.1 (December 2, 2019)
* Fix issue where null unsentKey and unsentIdentifyKeys were causing log crashes

### 5.7.0 (November 22, 2019)
* Namespace AsyncStorage with api key to prevent cross domain contamination

### 5.6.0 (October 21, 2019)

* Drop esm module from package.json to prevent it from being the default build.
* Add fallback localStorage support to the esm module.
* Fix integrity hash

### 5.5.0 (October 9, 2019)

* Fix bug where optOut settings would be overridden by cookie loading
* Fix initialization bugs introduced by removing legacy data migration code.
* Use `@react-native-community/async-storage` instead of the deprecated `AsyncStorage`.
* Pull react-native device identifier from device info when possible
* Pull react-native unsent events from async storage

### 5.4.2 (October 1, 2019)

* Fix issues with react native device identification
* Remove legacy cookie migration code

### 5.3.1 (August 26, 2019)

* Fix bug where runQueuedFunctions was unnecessarily being called on module import
* Update dependencies to pass yarn audit again.

### 5.3.0 (August 14, 2019)

* Add ES Module build #183
* Fix setDomain bug where setting the cookie domain clobbered other cookie setings

### 5.2.2 (March 29, 2019)

* Stop warning when `undefined` property values are instrumented

### 5.2.1 (March 28, 2019)

* Fix npm publish failure where built files were missing.

### 5.2.0 (March 28, 2019)

* Stop warning when `null` property values are instrumented
* Allow for objects nested within arrays

### 5.0.0 (March 19, 2019)

* Add `onInit` method that accepts a callback that will be invoked after init
* Allow for api endpoints that do not end with a trailing slash
* Sync with upstream ua-parser for user agent parsing
* Upgrade rollup/babel dependencies
* Invoke runQueuedFunctions from the main library instead of the snippet. This will allow integrations to take advantage of the queueing feature on sites that do not use the snippet.

#### Breaking Changes
* Drop JSON polyfill. This will break IE 7 and older. You can install your own JSON polyfill before loading amplitude.
* Stop committing generated files to the master branch in the git repository. You should not install amplitude from the master git branch. You should never import amplitude.min.js into your build.
* Drop custom user agent parsing for symbian and blackberry


### 4.7.0 (March 12, 2019)

* Cherry-picked from 5.0.0: Add `onInit` method that accepts a callback that will be invoked after init

### 4.6.0 (February 25, 2019)

* Add support for unsetting utm params when a new session is created
* Update dependencies to pass yarn audit
* Bugfix: Allow logLevel to be set to disabled.
* Bugfix: Update ua-parser to work in quirks mode in older internet explorer versions
* Fetch ua-parsers-js from npm instead of github
* Add `secureCookie` option to add a secure flag to the cookie

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
