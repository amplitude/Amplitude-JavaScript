import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: {
    name: 'amplitude',
    file: 'amplitude.esm.js',
    format: 'esm',
  },
  external: [/@babel\/runtime/],
  plugins: [
    json(),
    replace({
      preventAssignment: false,
      BUILD_COMPAT_SNIPPET: 'false',
      BUILD_COMPAT_LOCAL_STORAGE: 'true',
      BUILD_COMPAT_2_0: 'true',
    }),
    commonjs({
      include: "node_modules/**"
    }),
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
