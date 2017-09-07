module.exports = function(config) {
  const customLaunchers = {
    sauce_ie_8: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '8'
    },
    sauce_ie9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9.0'
    },
    sauce_edge: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
    },
    sauce_chrome_windows: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
    },
    sauce_safari_sierra: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'macOS 10.12',
    },
  };

  config.set({
    sauceLabs: {
      testName: 'Amplitude JavaScript SDK',
    },
    frameworks: ['mocha', 'chai', 'sinon'],
    files: ['amplitude-snippet.min.js', 'build/snippet-tests.js', 'build/tests.js'],
    reporters: ['mocha', 'saucelabs'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    customLaunchers,
    captureTimeout: 120000,
    browsers: ['ChromeHeadless'],
    // browsers: ['sauce_chrome_windows', 'sauce_edge', 'sauce_safari_sierra'],
    autoWatch: false,
    singleRun: true,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: 4,
  })
}
