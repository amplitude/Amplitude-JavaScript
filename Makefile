SRC = $(wildcard lib/*.js)
BINS = node_modules/.bin
DUO = $(BINS)/duo
MINIFY = $(BINS)/uglifyjs

#
# Clean.
#

clean:
	@-rm -rf components
	@-rm -f amplitude.js amplitude.min.js
	@-rm -rf node_modules npm-debug.log

#
# Target for `node_modules` folder.
#

node_modules: package.json
	@npm install

#
# Target for `analytics.js` file.
#

amplitude.js: node_modules $(SRC)
	@$(DUO) --standalone amplitude src/index.js > amplitude.js
	@$(MINIFY) amplitude.js --output amplitude.min.js
