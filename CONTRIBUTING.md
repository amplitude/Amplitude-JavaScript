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

### PR Commit Title Conventions

PR titles should follow [conventional commit standards](https://www.conventionalcommits.org/en/v1.0.0/). This helps automate the [release](#release) process.

#### Commit Types ([related to release conditions](#release))

- **Special Case**: Any commit with `BREAKING CHANGES` in the body: Creates major release
- `feat(<optional scope>)`: New features (minimum minor release)
- `fix(<optional scope>)`: Bug fixes (minimum patch release)
- `perf(<optional scope>)`: Performance improvement
- `docs(<optional scope>)`: Documentation updates
- `test(<optional scope>)`: Test updates
- `refactor(<optional scope>)`: Code change that neither fixes a bug nor adds a feature
- `style(<optional scope>)`: Code style changes (e.g. formatting, commas, semi-colons)
- `build(<optional scope>)`: Changes that affect the build system or external dependencies (e.g. Yarn, Npm)
- `ci(<optional scope>)`: Changes to our CI configuration files and scripts
- `chore(<optional scope>)`: Other changes that don't modify src or test files
- `revert(<optional scope>)`: Revert commit

### Release [Amplitude Internal]

Releases are managed by [semantic-release](https://github.com/semantic-release/semantic-release). It is a tool that will scan commits since the last release, determine the next [semantic version number](https://semver.org/), publish, and create changelogs.

#### Release Conditions [Amplitude Internal]

- `BREAKING CHANGES` in the body will do a major release
  ```
  feat(cookies): Create new cookie format
  
  BREAKING CHANGES: Breaks old cookie format
  ```
- Else `feat` in title will do a `minor` release
  `feat(cookies): some changes`
- Else `fix` or `perf` in title will do a `patch` release
  `fix: null check bug`
- Else no release
  `docs: update website`

