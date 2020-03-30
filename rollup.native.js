import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    name: 'amplitude',
    file: 'react-native/amplitude.native.js',
    format: 'umd',
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      plugins: ['@babel/plugin-proposal-object-rest-spread'],
    }),
    resolve({
      browser: true,
    }),
    replace({
      BUILD_COMPAT_SNIPPET: 'false',
      BUILD_COMPAT_2_0: 'true',
      BUILD_COMPAT_LOCAL_STORAGE: 'true',
      BUILD_COMPAT_REACT_NATIVE: 'true',
    }),
    commonjs(),
  ],
};
