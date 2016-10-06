'use strict';

import webpack from 'webpack';
import prodConfig from './main.babel';

export default {
  ...prodConfig,
  plugins: [
    // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('development')})
  ],
  debug: true,
  devtool: 'inline-source-map'
};
