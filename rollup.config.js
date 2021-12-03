import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.js',
  output: {
    name: 'amplitude',
    file: 'amplitude.js',
    format: 'iife',
    amd: {
      id: 'amplitude',
    }
  },
  plugins: [
    json(),
    resolve({
      browser: true,
    }),
    replace({
      preventAssignment: false,
      BUILD_COMPAT_SNIPPET: 'true',
      BUILD_COMPAT_LOCAL_STORAGE: 'true',
      BUILD_COMPAT_2_0: 'true',
    }),
    commonjs(),
    babel({
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-transform-runtime'
      ],
    }),
  ],
};
