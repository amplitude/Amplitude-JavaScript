## Unreleased

* Add support for passing callback function to identify.
* Add support for prepend user property operation.
* Keep sessions and event metadata in sync across multiple windows/tabs.
* Add support for setting groups for users and events.
* Add support for logging events to multiple Amplitude apps. **Note this is a major update, and may break backwards compatability.** See [Readme](https://github.com/amplitude/Amplitude-Javascript#300-update-and-logging-events-to-multiple-amplitude-apps) for details.
* Init callback now passes the Amplitude instance as an argument to the callback function.

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
