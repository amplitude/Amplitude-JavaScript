## Unreleased

* Fix bug to check that Window localStorage is available for use.

## 2.4.0 (September 4, 2015)

* Add support for passing callback functions to logEvent

## 2.3.0 (September 2, 2015)

* Add option to batch events into a single request.

## 2.2.1 (Aug 13, 2015)

* Fix bug where multi-byte unicode characters were hashed improperly.
* Add option to sent referrer information as user properties

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
