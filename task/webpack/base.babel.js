'use strict';

import {ROOT_PATH} from '../path-config';

export default {

  context: ROOT_PATH,

  output: {
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader!babel-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?mimetype=application/font-woff'
      },

      // https://github.com/lynndylanhurley/redux-auth/issues/26
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  stats: {
    colors: true,
    reasons: true,
    hash: false,
    modulesSort: 'name'
  },

  plugins: []

};
