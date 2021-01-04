SRC = $(wildcard src/*.js)
SNIPPET = src/amplitude-snippet.js
TESTS = $(wildcard test/*.js)
BINS = node_modules/.bin
MINIFY = $(BINS)/uglifyjs
JSDOC = $(BINS)/jsdoc
BUILD_DIR = build
PROJECT = amplitude
OUT = $(PROJECT).js
SNIPPET_OUT = $(PROJECT)-snippet.min.js
SEGMENT_SNIPPET_OUT = $(PROJECT)-segment-snippet.min.js
MIN_OUT = $(PROJECT).min.js
MOCHA = $(BINS)/mocha-phantomjs
KARMA = $(BINS)/karma
ROLLUP = $(BINS)/rollup

#
# Default target.
#

default: test

#
# Clean.
#

clean:
	@-rm -f amplitude.js amplitude.min.js
	@-rm -rf node_modules npm-debug.log


#
# Test.
#

test: build
	@$(KARMA) start karma.conf.js

test-sauce: build
	@$(KARMA) start karma.conf.js --browsers sauce_chrome_windows


#
# Target for `node_modules` folder.
#

node_modules: package.json
	@yarn

#
# Target for updating version.

version: package.json
	node scripts/version

#
# Target for updating readme.

README.md: $(SNIPPET_OUT) version
	node scripts/readme

#
# Target for `amplitude.js` file.
#

$(OUT): node_modules $(SRC) package.json rollup.config.js rollup.min.js rollup.native.js rollup.esm.js rollup.umd.js rollup.umd.min.js
	@NODE_ENV=production $(ROLLUP) --config rollup.config.js # is the snippet build config
	@NODE_ENV=production $(ROLLUP) --config rollup.esm.js # does not concat dependencies, only has module and dependencies
	@NODE_ENV=production $(ROLLUP) --config rollup.umd.js # generates npm version, also usable in require js app
	@NODE_ENV=production $(ROLLUP) --config rollup.native.js # generates react native build
	@NODE_ENV=production $(ROLLUP) --config rollup.nocompat.js # may be able to remove
	@NODE_ENV=production $(ROLLUP) --config rollup.umd.min.js
	@NODE_ENV=production $(ROLLUP) --config rollup.min.js
	@NODE_ENV=production $(ROLLUP) --config rollup.nocompat.min.js # may be able to remove

#
# Target for minified `amplitude-snippet.js` file.
#
$(SNIPPET_OUT): $(SRC) $(SNIPPET)
	@$(MINIFY) $(SNIPPET) -m -b max-line-len=80,beautify=false | awk 'NF' > $(SNIPPET_OUT)

$(SEGMENT_SNIPPET_OUT): $(SRC) $(SNIPPET)
	@grep -Ev "\ba?s\b" $(SNIPPET) | $(MINIFY) -m -b max-line-len=80,beautify=false - \
		| awk 'NF' > $(SEGMENT_SNIPPET_OUT)

#
# Target for `tests-build.js` file.
#

build: $(TESTS) $(OUT) $(SNIPPET_OUT) $(SEGMENT_SNIPPET_OUT)
	@$(ROLLUP) --config rollup.test.js
	@$(ROLLUP) --config rollup.snippet-tests.js
	@-echo "Done building"

docs:
	@$(JSDOC) -d ./documentation/ src/*.js

#
# Target for release.
#

release: $(OUT) $(SNIPPET_OUT) README.md
	@-mkdir -p dist
	node scripts/release

.PHONY: clean
.PHONY: test
