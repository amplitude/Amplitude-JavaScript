# AGENTS.md

## Cursor Cloud specific instructions

This is the **Amplitude JavaScript SDK** (`amplitude-js`), a client-side analytics library. No external services or databases are required.

### Node version

The project requires **Node.js 14.4.0** (specified in `.node-version`). Use `nvm use 14.4.0` before running commands. Yarn must be called with `--ignore-engines` because `@semantic-release/npm` (a release-only devDependency) requires Node >= 22.

### Key commands

All standard commands are in `package.json` scripts and `Makefile`:

- **Install**: `yarn install --ignore-engines`
- **Build**: `make build` (or `yarn build`) — produces IIFE, ESM, UMD, and test bundles via Rollup
- **Test**: `make test` (or `yarn test`) — runs Karma + Mocha/Chai/Sinon in ChromeHeadless. Requires `CHROME_BIN` to be set (e.g. `export CHROME_BIN=$(which google-chrome)`).
- **Lint**: `yarn lint` (Prettier + ESLint)
- **Fix lint**: `yarn fix`
- **Dev server**: `yarn dev` — starts Express on `localhost:9000` serving browser test pages from `test/browser/`

### Gotchas

- `make build` must complete before `make test` — the test target depends on build output in `build/` and `amplitude-snippet.min.js`.
- The `Browserslist: caniuse-lite is outdated` warning during builds is cosmetic and does not affect functionality.
- Karma uses `ChromeHeadless` by default. Set `export CHROME_BIN=$(which google-chrome)` if the environment variable is not already set.
- The project uses Husky v8 with `lint-staged` for pre-commit hooks (Prettier + ESLint). This is configured in `package.json` under `husky` and `lint-staged` keys.
