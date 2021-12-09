module.exports = config => {
  config.set({
    frameworks: ['mocha-webworker'],
    files: [
      {
        pattern: 'test/web-worker.js',
        included: false,
      },
      {
        pattern: 'amplitude.js',
        included: false,
      },
    ],
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    reporters: ['mocha'],
    client: {
      mochaWebWorker: {
        pattern: ['test/web-worker.js', 'amplitude.js'],
        worker: 'Worker',
        mocha: {
          ui: 'bdd'
        }
      }
    }
  });
};
