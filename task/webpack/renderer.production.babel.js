'use strict';

import webpack from 'webpack';
import baseConfig from './base.babel.js';
import {SRC_DIR, DIST_DIR} from '../path-config';

export default {
  ...baseConfig,

  entry: [
    `./${SRC_DIR}/renderer/index`
  ],

  output: {
    ...baseConfig.output,
    path: `./${DIST_DIR}/renderer`,
    publicPath: `/${DIST_DIR}`
  },

  module: {
    ...baseConfig.module,
    loaders: [
      ...baseConfig.module.loaders
    ]
  },

  plugins: [
    ...baseConfig.plugins,

    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurrenceOrderPlugin(),

    // https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({warnings: false}),

    // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})

  ],

  // https://webpack.github.io/docs/configuration.html#target
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer'

};
