'use strict';

import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import baseConfig from './base.babel.js';
import {SRC_DIR, DIST_DIR} from '../path-config';

export default {
  ...baseConfig,

  entry: [
    `./${SRC_DIR}/renderer/index.js`,
    `./${SRC_DIR}/renderer/styles/index.sass`
  ],

  output: {
    ...baseConfig.output,
    path: `./${DIST_DIR}/renderer`,
    publicPath: `/${DIST_DIR}`
  },

  module: {
    ...baseConfig.module,
    loaders: [
      ...baseConfig.module.loaders,
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
      },
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'),
      }
    ]
  },

  plugins: [
    ...baseConfig.plugins,

    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurrenceOrderPlugin(),

    // https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({warnings: false}),

    // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}),

    // https://github.com/webpack/extract-text-webpack-plugin
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],

  // https://webpack.github.io/docs/configuration.html#target
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer'

};
