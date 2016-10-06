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
      }
    ]
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },

  stats: {
    colors: true,
    reasons: true,
    hash: false,
    modulesSort: 'name'
  },

  plugins: []

};
