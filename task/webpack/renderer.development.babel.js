'use strict';

import webpack from 'webpack';
import baseConfig from './base.babel.js';
import {SRC_DIR, DIST_DIR} from '../path-config';

const PORT = process.env.PORT || 8080;

export default {
  ...baseConfig,

  entry: [
    `webpack-dev-server/client?http://localhost:${PORT}`,
    'webpack/hot/dev-server',
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

    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    // http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
    new webpack.NoErrorsPlugin(),

    // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('development')})

  ],

  // https://webpack.github.io/docs/configuration.html#target
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer',

  debug: true,
  devtool: 'cheap-module-eval-source-map',

  devServer: {
    port: PORT,
    hot: true,
    inline: true,
    contentBase: './dist',
    stats: {
      chunks: false
    }
  }

};
