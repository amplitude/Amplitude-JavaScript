SRC = $(wildcard src/*.js)
SNIPPET = src/amplitude-snippet.js
TESTS = $(wildcard test/*.js)
BINS = node_modules/.bin
DUO = $(BINS)/duo
MINIFY = $(BINS)/uglifyjs
JSDOC = $(BINS)/jsdoc
JSHINT = $(BINS)/jshint
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
	@npm install

#
# Target for updating version.

version: package.json src/version.js
	@$(ROLLUP) src/version.js -o build/version.js -f cjs
	node scripts/version

#
# Target for updating readme.

README.md: $(SNIPPET_OUT) version
	node scripts/readme

#
# Target for `amplitude.js` file.
#

$(OUT): node_modules $(SRC) version rollup.config.js rollup.min.js
	@$(JSHINT) --verbose $(SRC)
	@NODE_ENV=production $(ROLLUP) --config rollup.config.js
	@NODE_ENV=production $(ROLLUP) --config rollup.min.js

#
# Target for minified `amplitude-snippet.js` file.
#
$(SNIPPET_OUT): $(SRC) $(SNIPPET) version
	@$(JSHINT) --verbose $(SNIPPET)
	@$(MINIFY) $(SNIPPET) -m -b max-line-len=80,beautify=false | awk 'NF' > $(SNIPPET_OUT)

$(SEGMENT_SNIPPET_OUT): $(SRC) $(SNIPPET) version
	@grep -Ev "\ba?s\b" $(SNIPPET) | $(MINIFY) -m -b max-line-len=80,beautify=false - \
		| awk 'NF' > $(SEGMENT_SNIPPET_OUT)

#
# Target for `tests-build.js` file.
#

build: $(TESTS) $(OUT) $(SNIPPET_OUT) $(SEGMENT_SNIPPET_OUT) README.md
	@$(ROLLUP) --config rollup.test.js
	@$(DUO) --development test/snippet-tests.js > build/snippet-tests.js

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
