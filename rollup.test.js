import config from './rollup.config.js';

config.input = 'test/tests.js';
config.output.file = 'build/tests.js';

export default config;
