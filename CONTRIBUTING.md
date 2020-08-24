# Contributing to the Amplitude SDK for JavaScript
🎉 Thanks for your interest in contributing! 🎉

## Ramping Up
### Intro
- There are three ways for SDK to be loaded
  - Standard NPM package
  - Snippet in `<script>` tag
  - RequireJS (may be dropped in future)
- Workflow is facilitated with both `make` and `yarn` (legacy, may possibly be updated to full `yarn`)
- Chek out the [Amplitude Instrumentation Explorer]((https://chrome.google.com/webstore/detail/amplitude-instrumentation/acehfjhnmhbmgkedjmjlobpgdicnhkbp)) to help logging events during development

### Architecture
- `index.js` is the main entrypoint of SDK
- Stubbed methods are used when client imports via `<script>` snippet
  - Allows app to not be blocked while real JS SDK is loaded in
  - Sent events and identifys are tracked with queues
- Metadata storage (new) vs cookie (old) storage
  - more of issue with anonymous id, because it uses device id instead of user id
- UA Parser: Helps identify browsers
  - might be able to use upstream library and convert results, rather than our fork
- sameSiteCookie: Sets how public the cookie reading is
  - `amplitude.getInstance() is necessary even during reuse because of snippet stubbed
    - only applicable to snippet import

### Setting Up Development
- Cloning, installing, and building
```
git clone git@github.com:amplitude/Amplitude-JavaScript.git
cd Amplitude-JavaScript
make # Runs tests and generate builds
yarn dev # Start development utility. Open localhost:9000 in your browser to access
```
