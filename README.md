<p align="center">
  <a href="https://amplitude.com" target="_blank" align="center">
    <img src="https://static.amplitude.com/lightning/46c85bfd91905de8047f1ee65c7c93d6fa9ee6ea/static/media/amplitude-logo-with-text.4fb9e463.svg" width="280">
  </a>
  <br />
</p>

<div align="center">

  [![Test](https://github.com/amplitude/Amplitude-JavaScript/workflows/Test/badge.svg)](https://github.com/amplitude/Amplitude-JavaScript/actions?query=workflow%3ATest)
  [![npm version](https://badge.fury.io/js/amplitude-js.svg)](https://badge.fury.io/js/amplitude-js)
  [![Bower version](https://badge.fury.io/bo/amplitude-js.svg)](https://badge.fury.io/bo/amplitude-js)

</div>

# Official Amplitude JS/Web SDK
A JavaScript SDK for tracking events and revenue to [Amplitude](https://www.amplitude.com).

## Installation and Quick Start
* For using the SDK, please visit our :100:[Developer Center](https://developers.amplitude.com/docs/javascript).
* For developing the SDK, please visit our [CONTRIBUTING.md](https://github.com/amplitude/Amplitude-JavaScript/blob/master/CONTRIBUTING.md).

## Demo Pages
* A [demo page](https://github.com/amplitude/Amplitude-JavaScript/blob/master/test/browser/amplitudejs.html) showing a simple integration on a web page.
* A [demo page](https://github.com/amplitude/Amplitude-JavaScript/blob/master/test/browser/amplitudejs-requirejs.html) showing an integration using RequireJS.
* A [demo page](https://github.com/amplitude/GTM-Web-Demo) demonstrating a potential integration with Google Tag Manager.


## Deprecated - React Native
As of >= v8.0.0, this SDK no longer has support for React Native. We recently released a new SDK focused on providing a React Native first approach to using Amplitude in cross-platform projects.  [Amplitude React Native SDK](https://github.com/amplitude/Amplitude-ReactNative)

Previously used amplitude-js and looking to migrate to @amplitude/react-native?
* Please follow the steps detailed in our [migration guide](https://github.com/amplitude/Amplitude-ReactNative/blob/main/MIGRATION_GUIDE.md)

## Node.js
Please visit [Amplitude-Node](https://github.com/amplitude/Amplitude-Node) for our Node SDK.

## Changelog
Click [here](https://github.com/amplitude/Amplitude-JavaScript/blob/master/CHANGELOG.md) to view the JavaScript SDK Changelog.

## Upgrading Major Versions and Breaking Changes #

### 6.0
The cookie format has been changed to be more compact. If you use the same
Amplitude project(API key) across multiple applications, and you track
anonymous users across those applications, you will want to update amplitude
across all those applications at the same time. Otherwise these anonymous users
will have a different device id in your different applications.

If you do not have multiple installations of amplitude, or if you do not track
anonymous users across different installations of amplitude, this change should
not affect you.

### 5.0
We stopped committing the generated amplitude.min.js and amplitude.js files to
the repository. This should only affect you if you load amplitude via github.
You should use `npm` or `yarn` instead.

We dropped our custom symbian and blackberry user agent parsing to simply match
what the ua-parser-js library does.

### 4.0
The library now defaults to sending requests to https://api.amplitude.com
instead of //api.amplitude.com. This should only affect you if your site does
not use https and you use a Content Security Policy.

## Need Help?
If you have any problems or issues over our SDK, feel free to create a github issue or submit a request on [Amplitude Help](https://help.amplitude.com/hc/en-us/requests/new).
