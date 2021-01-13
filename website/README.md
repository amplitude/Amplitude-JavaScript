# Website

The JavaScript SDK API Reference website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

### Installation

Run `yarn docs:install` to install website dependencies.

### Generating `website/docs/` from `src/`

The website autogenerates markdown files of public classes and its contents using [generate-jsdoc.js](https://github.com/amplitude/Amplitude-JavaScript/blob/main/website/generate-jsdoc.js).

This is done by calling `yarn docs:generate-jsdoc` from the base directory.

### Local Development Build

Run `yarn start` from this directory or `yarn docs:start` from the base directory.

Because of a bug with how Docusaurus handles `baseUrl` in `docusaurus.config.js`, you should open `localhost:3000/Amplitude-JavaScript` instead of the default `localhost:3000/`

### Local Production Build

Similar to local development build process. This command generates static content into the `website/build/` directory and creates a server to serve it.

Run `yarn serve` from this directory or `yarn docs:serve` from the base directory. Then open `localhost:3000/Amplitude-JavaScript`

### Deployment

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

This will create the production build and push it the `gh-pages` branch.
