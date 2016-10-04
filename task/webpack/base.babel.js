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
        exclude: /node_modules/,
        loader: 'babel-loader',
        test: /\.js$/
      }
    ]
  },

  plugins: []

};
