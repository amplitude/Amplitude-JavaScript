## [8.21.1](https://github.com/amplitude/amplitude-javascript/compare/v8.21.0...v8.21.1) (2022-09-22)


### Bug Fixes

* update analytics connector for bugfix ([#555](https://github.com/amplitude/amplitude-javascript/issues/555)) ([3f37f18](https://github.com/amplitude/amplitude-javascript/commit/3f37f1834bd3301af0aa936f4306bf004658050e))

# [8.21.0](https://github.com/amplitude/amplitude-javascript/compare/v8.20.1...v8.21.0) (2022-09-08)


### Features

* add ingestion_metadata field ([#552](https://github.com/amplitude/amplitude-javascript/issues/552)) ([14c590c](https://github.com/amplitude/amplitude-javascript/commit/14c590c2eefa312bc6bce11c8baba518848ef3f0))

## [8.20.1](https://github.com/amplitude/amplitude-javascript/compare/v8.20.0...v8.20.1) (2022-09-01)


### Bug Fixes

* upgrade @amplitude/utils version ([#553](https://github.com/amplitude/amplitude-javascript/issues/553)) ([aa63d57](https://github.com/amplitude/amplitude-javascript/commit/aa63d579d5c47428b28249b410ea2550841bacb8))

# [8.20.0](https://github.com/amplitude/amplitude-javascript/compare/v8.19.0...v8.20.0) (2022-08-24)


### Features

* enable the ability to overwrite the referrer ([#551](https://github.com/amplitude/amplitude-javascript/issues/551)) ([03c0a89](https://github.com/amplitude/amplitude-javascript/commit/03c0a890d578db1ada383cf1e6195d71275bac44))

# [8.19.0](https://github.com/amplitude/amplitude-javascript/compare/v8.18.5...v8.19.0) (2022-07-25)


### Features

* add partner_id support ([#545](https://github.com/amplitude/amplitude-javascript/issues/545)) ([7b343ea](https://github.com/amplitude/amplitude-javascript/commit/7b343ea7341185e448cb2fe13ff82213cc3ba817))

## [8.18.5](https://github.com/amplitude/amplitude-javascript/compare/v8.18.4...v8.18.5) (2022-06-24)


### Bug Fixes

* add guard for navigator for use in envs that do no support navigator ([#542](https://github.com/amplitude/amplitude-javascript/issues/542)) ([c3b31ad](https://github.com/amplitude/amplitude-javascript/commit/c3b31ad34fd3c16ab743346b785fe632c48d2c21))
* fix s3 upload script to use iam role ([#534](https://github.com/amplitude/amplitude-javascript/issues/534)) ([a453dc3](https://github.com/amplitude/amplitude-javascript/commit/a453dc3c9b830f916414551597014d61f2a509ac))

## [8.18.4](https://github.com/amplitude/amplitude-javascript/compare/v8.18.3...v8.18.4) (2022-05-31)


### Bug Fixes

* polyfill object entries for ie11 ([#536](https://github.com/amplitude/amplitude-javascript/issues/536)) ([9e68a45](https://github.com/amplitude/amplitude-javascript/commit/9e68a4585c1d7147eca99d3be296054e8c232081))

## [8.18.3](https://github.com/amplitude/amplitude-javascript/compare/v8.18.2...v8.18.3) (2022-05-24)


### Bug Fixes

* upgrade to @amplitude/ua-parser-js@0.7.31 ([#535](https://github.com/amplitude/amplitude-javascript/issues/535)) ([7756b52](https://github.com/amplitude/amplitude-javascript/commit/7756b522ccd5fb5d91baa559f52690dc1a6b4f6e))

## [8.18.2](https://github.com/amplitude/amplitude-javascript/compare/v8.18.1...v8.18.2) (2022-05-12)


### Bug Fixes

* assign domain after cookie storage options are given ([#528](https://github.com/amplitude/amplitude-javascript/issues/528)) ([2440e9a](https://github.com/amplitude/amplitude-javascript/commit/2440e9a0309236a27bd639ced87b2d2187d2d48b))
* fix perms for github token in release workflow ([#532](https://github.com/amplitude/amplitude-javascript/issues/532)) ([195c6ef](https://github.com/amplitude/amplitude-javascript/commit/195c6ef158ec3d81b3a9308988f2aec6e19f7ffb))
* fix release work flow perms to include write access to contents ([#533](https://github.com/amplitude/amplitude-javascript/issues/533)) ([c8845ca](https://github.com/amplitude/amplitude-javascript/commit/c8845caec66b12d954ebb0ddeb2aa4e2d8dc29b8))
* replace String.prototype.includes with String.prototype.indexOf ([#530](https://github.com/amplitude/amplitude-javascript/issues/530)) ([b0992f8](https://github.com/amplitude/amplitude-javascript/commit/b0992f818e5986985a62f8c2b178729c805d4060))
* update analytics connector 1.4.2 ([#531](https://github.com/amplitude/amplitude-javascript/issues/531)) ([fba43bf](https://github.com/amplitude/amplitude-javascript/commit/fba43bfe55cc50a80cdbb83dd3616cc3392007c4))

## [8.18.1](https://github.com/amplitude/amplitude-javascript/compare/v8.18.0...v8.18.1) (2022-04-06)


### Bug Fixes

* update analytics-connector to 1.4.1 ([#520](https://github.com/amplitude/amplitude-javascript/issues/520)) ([956d53b](https://github.com/amplitude/amplitude-javascript/commit/956d53b93283ccbe7985d2502dd1b117cc575e08))

# [8.18.0](https://github.com/amplitude/amplitude-javascript/compare/v8.17.0...v8.18.0) (2022-03-31)


### Features

* Add versionId to tracking plan data ([#518](https://github.com/amplitude/amplitude-javascript/issues/518)) ([26dd38b](https://github.com/amplitude/amplitude-javascript/commit/26dd38b96ca4dd5f52670e287dee16a0c9881d32))

# [8.17.0](https://github.com/amplitude/amplitude-javascript/compare/v8.16.1...v8.17.0) (2022-02-10)


### Features

* Support seamless integration with amplitude experiment SDK ([#457](https://github.com/amplitude/amplitude-javascript/issues/457)) ([af8f9d1](https://github.com/amplitude/amplitude-javascript/commit/af8f9d15f276773dd1aaff28645d5dad38dc1f35))

## [8.16.1](https://github.com/amplitude/amplitude-javascript/compare/v8.16.0...v8.16.1) (2022-01-28)


### Bug Fixes

* use Date.now() for test cookie value ([#495](https://github.com/amplitude/amplitude-javascript/issues/495)) ([03e270e](https://github.com/amplitude/amplitude-javascript/commit/03e270e3a001130064e368ff4e033b2d00612ff1))

# [8.16.0](https://github.com/amplitude/amplitude-javascript/compare/v8.15.1...v8.16.0) (2022-01-21)


### Bug Fixes

* catch errors with Request.send ([#490](https://github.com/amplitude/amplitude-javascript/issues/490)) ([333f8a4](https://github.com/amplitude/amplitude-javascript/commit/333f8a4b6dca512c7c57e64ef2d6072020e5debd))


### Features

* accept custom session id paramter in config ([#485](https://github.com/amplitude/amplitude-javascript/issues/485)) ([b64b8b0](https://github.com/amplitude/amplitude-javascript/commit/b64b8b0d0619c5f749e71dca45773d7c869631bb))
* allow cors header to be excluded from request headers ([#489](https://github.com/amplitude/amplitude-javascript/issues/489)) ([0119ac7](https://github.com/amplitude/amplitude-javascript/commit/0119ac7b92ba969e70189a6d212e7092e9e27818))

## [8.15.1](https://github.com/amplitude/amplitude-javascript/compare/v8.15.0...v8.15.1) (2022-01-18)


### Bug Fixes

* Add missing worker storage length for clear method ([#487](https://github.com/amplitude/amplitude-javascript/issues/487)) ([6abb957](https://github.com/amplitude/amplitude-javascript/commit/6abb957b8cad332d4a020ffd8e9feb74a6b3096b))

# [8.15.0](https://github.com/amplitude/amplitude-javascript/compare/v8.14.1...v8.15.0) (2022-01-07)


### Features

* make snippet public in NPM ([#478](https://github.com/amplitude/amplitude-javascript/issues/478)) ([8f512f0](https://github.com/amplitude/amplitude-javascript/commit/8f512f0a3811acaffd3ad7662dcf0ca6738e0522))

## [8.14.1](https://github.com/amplitude/amplitude-javascript/compare/v8.14.0...v8.14.1) (2021-12-23)


### Bug Fixes

* global-scope reference error in nodejs ([#474](https://github.com/amplitude/amplitude-javascript/issues/474)) ([bdce39d](https://github.com/amplitude/amplitude-javascript/commit/bdce39daedf8ff965e43f038cd2c73319c63930d))

# [8.14.0](https://github.com/amplitude/amplitude-javascript/compare/v8.13.1...v8.14.0) (2021-12-21)


### Features

* add runNewSessionStartCallback on new sessionId on log event ([#469](https://github.com/amplitude/amplitude-javascript/issues/469)) ([bb8b26b](https://github.com/amplitude/amplitude-javascript/commit/bb8b26b23267ed6fd5adc393f873e2d1103f4030))
* support web worker env ([#467](https://github.com/amplitude/amplitude-javascript/issues/467)) ([52abaf0](https://github.com/amplitude/amplitude-javascript/commit/52abaf062492217ddf8d556b85509ce00e006f25))

## [8.13.1](https://github.com/amplitude/amplitude-javascript/compare/v8.13.0...v8.13.1) (2021-12-03)


### Bug Fixes

* make @babel/runtime production dependencies ([#461](https://github.com/amplitude/amplitude-javascript/issues/461)) ([c03632c](https://github.com/amplitude/amplitude-javascript/commit/c03632c7e66cbd2a8a31455114e9a771a5d988cc))

# [8.13.0](https://github.com/amplitude/amplitude-javascript/compare/v8.12.0...v8.13.0) (2021-11-30)


### Bug Fixes

* add public method onNewSessionStart to snippet ([#459](https://github.com/amplitude/amplitude-javascript/issues/459)) ([07446fc](https://github.com/amplitude/amplitude-javascript/commit/07446fc1158c0ef3ff21e9e13c6deb3b9ef6fd36))
* upgrade to @amplitude/ua-parser-js@0.7.26 ([#456](https://github.com/amplitude/amplitude-javascript/issues/456)) ([8962604](https://github.com/amplitude/amplitude-javascript/commit/8962604657224c940991e36876255c4f12a7abfc))


### Features

* add support for on new session start callback ([#455](https://github.com/amplitude/amplitude-javascript/issues/455)) ([acf596a](https://github.com/amplitude/amplitude-javascript/commit/acf596a52ff12bad8c9352533fd15f13becf374a))

# [8.12.0](https://github.com/amplitude/amplitude-javascript/compare/v8.11.1...v8.12.0) (2021-11-18)


### Features

* add more interface for flutter web support ([#444](https://github.com/amplitude/amplitude-javascript/issues/444)) ([69c18f7](https://github.com/amplitude/amplitude-javascript/commit/69c18f7253f39f63b4204bbf15a604b0f458e98c))
* update setLibrary api make it ignore the null value of name or version  ([#449](https://github.com/amplitude/amplitude-javascript/issues/449)) ([8e0971e](https://github.com/amplitude/amplitude-javascript/commit/8e0971e00164dfb6206e73e51da9329b2f5f2009))

## [8.11.1](https://github.com/amplitude/amplitude-javascript/compare/v8.11.0...v8.11.1) (2021-11-16)


### Bug Fixes

* Add missing setTransport API to snippet ([#446](https://github.com/amplitude/amplitude-javascript/issues/446)) ([355a05b](https://github.com/amplitude/amplitude-javascript/commit/355a05baad6ac15b68cfe51ff95b28aff04850d0))

# [8.11.0](https://github.com/amplitude/amplitude-javascript/compare/v8.10.0...v8.11.0) (2021-11-16)


### Bug Fixes

* add missing setLibrary API to snippet distribution ([#445](https://github.com/amplitude/amplitude-javascript/issues/445)) ([ff44909](https://github.com/amplitude/amplitude-javascript/commit/ff44909711fa2e59852b1785ee3ef99cf704a48f))


### Features

* add esm entry point ([#440](https://github.com/amplitude/amplitude-javascript/issues/440)) ([3e98d50](https://github.com/amplitude/amplitude-javascript/commit/3e98d506f003ba428ab08796d1246ccb387d1f32))

# [8.10.0](https://github.com/amplitude/amplitude-javascript/compare/v8.9.1...v8.10.0) (2021-11-12)


### Features

* custom library options and setter ([#443](https://github.com/amplitude/amplitude-javascript/issues/443)) ([dce0eac](https://github.com/amplitude/amplitude-javascript/commit/dce0eac92861f4c0efa4d3561f95e887e61e3874))

## [8.9.1](https://github.com/amplitude/amplitude-javascript/compare/v8.9.0...v8.9.1) (2021-11-02)


### Bug Fixes

* allow amplitude to be imported/required during SSR ([#436](https://github.com/amplitude/amplitude-javascript/issues/436)) ([ff7d8ef](https://github.com/amplitude/amplitude-javascript/commit/ff7d8ef156d0a59dba26d9e637c6b15fb3079479))

# [8.9.0](https://github.com/amplitude/amplitude-javascript/compare/v8.8.0...v8.9.0) (2021-10-28)


### Features

* eu dynamic configuration support ([#439](https://github.com/amplitude/amplitude-javascript/issues/439)) ([0618a90](https://github.com/amplitude/amplitude-javascript/commit/0618a901ab0209a44d05eacd82d1a6cbabf6a945))

# [8.8.0](https://github.com/amplitude/amplitude-javascript/compare/v8.7.0...v8.8.0) (2021-09-22)


### Features

* add observe plan options ([#427](https://github.com/amplitude/amplitude-javascript/issues/427)) ([529ad88](https://github.com/amplitude/amplitude-javascript/commit/529ad88748d17ade999a9dee0c0d17b6c7dbae3e))

# [8.7.0](https://github.com/amplitude/amplitude-javascript/compare/v8.6.0...v8.7.0) (2021-09-16)


### Features

* add cross origin resource policy header ([#426](https://github.com/amplitude/amplitude-javascript/issues/426)) ([709078f](https://github.com/amplitude/amplitude-javascript/commit/709078f53d0dd2cecb53e4c391caf9b9275e76d5))

# [8.6.0](https://github.com/amplitude/amplitude-javascript/compare/v8.5.0...v8.6.0) (2021-09-08)


### Features

* Mobile device model support ([#425](https://github.com/amplitude/amplitude-javascript/issues/425)) ([d06f5c6](https://github.com/amplitude/amplitude-javascript/commit/d06f5c61797434aa4bbf65ddd3a6e7b67c511064))

# [8.5.0](https://github.com/amplitude/amplitude-javascript/compare/v8.4.0...v8.5.0) (2021-08-13)


### Bug Fixes

* LGTM return fix for falsy str ([#416](https://github.com/amplitude/amplitude-javascript/issues/416)) ([f744fe7](https://github.com/amplitude/amplitude-javascript/commit/f744fe7dbd02974d6e3adedf662c966a7012335d))


### Features

* add sendBeacon support ([#412](https://github.com/amplitude/amplitude-javascript/issues/412)) ([0517038](https://github.com/amplitude/amplitude-javascript/commit/0517038951691a447a34a7581e9dddd86b6434bf))

# [8.4.0](https://github.com/amplitude/amplitude-javascript/compare/v8.3.1...v8.4.0) (2021-07-30)


### Features

* Add error callback ([#413](https://github.com/amplitude/amplitude-javascript/issues/413)) ([c50429d](https://github.com/amplitude/amplitude-javascript/commit/c50429dada5e0b5dc3b98be58738a5b669f05903))

## [8.3.1](https://github.com/amplitude/amplitude-javascript/compare/v8.3.0...v8.3.1) (2021-06-10)


### Bug Fixes

* Prevent periods in device id check ([#405](https://github.com/amplitude/amplitude-javascript/issues/405)) ([b872d7e](https://github.com/amplitude/amplitude-javascript/commit/b872d7e4a384b53b61e7232fb7b3ce4a4ddff83e))

# [8.3.0](https://github.com/amplitude/amplitude-javascript/compare/v8.2.3...v8.3.0) (2021-05-26)


### Features

* Clear Storage API ([#396](https://github.com/amplitude/amplitude-javascript/issues/396)) ([e8cb8b7](https://github.com/amplitude/amplitude-javascript/commit/e8cb8b728d1aede4aec82e5d040f27e057c4758a))

## [8.2.3](https://github.com/amplitude/amplitude-javascript/compare/v8.2.2...v8.2.3) (2021-05-18)


### Bug Fixes

* reduce log level of cookie test ([#394](https://github.com/amplitude/amplitude-javascript/issues/394)) ([c4bb241](https://github.com/amplitude/amplitude-javascript/commit/c4bb2413dfb217991ab5192e56ac3ae568bc92b9))

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
