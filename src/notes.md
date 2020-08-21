# Intro
- Three ways for SDK to be loaded
  - Standard NPM package
  - Snippet in `<script>` tag
  - RequireJS (may be dropped in future)
- Build system is Make instead of yarn (legacy, may possibly be updated)
- Use Amplitude Instrumentation Explorer to help development
  - "Instrumentation" involves matters related to logging user actions (i.e. events)

# Concerns
- Keep in mind backwards compatibility
- Keep SDK build size as small as possible
- Should support as many browsers as possible

# Architecture
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
    - Can possibly do better?

# Development
- Run `yarn dev` and open `localhost:9000` for development tools in browser

# Misc
- Readme.io used for documentation

# Ideas
- E2E browser tests with sauce labs
- merge with node?

Question
- Browser compat?
- MaxMind
  - Determines region from IP address
- Some custoemrs wont update SDK
- Consideration to bring up durign PE weekly monday discussion
  - browserslist?
  - eslint plugin compat?
  - Automation for updating docs when new SDK version is published
  - Google Tag Manager: Allows people at runtime to add random script tag
- No plans to stop snippet
  - might stop require js
- user & account lookup, allows seeing stream of events sent from users