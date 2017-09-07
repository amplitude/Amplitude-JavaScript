const webpack = require('webpack');

module.exports = {
  entry: `${__dirname}/test/tests.js`,
  devtool: 'eval',
  output: {
    path: `${__dirname}/build`,
    filename: 'tests.js',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
};
