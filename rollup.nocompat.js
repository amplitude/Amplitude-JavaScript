import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'amplitude',
    file: 'amplitude.nocompat.js',
    format: 'umd',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      externalHelpersWhitelist: ['defineProperty', 'extends', 'typeof'],
      plugins: ['external-helpers', 'transform-object-rest-spread'],
    }),
    resolve({
      browser: true,
    }),
    replace({
      BUILD_COMPAT_SNIPPET: 'false',
      BUILD_COMPAT_2_0: 'false',
      BUILD_COMPAT_LOCAL_STORAGE: 'false',
    }),
    commonjs(),
  ],
}
