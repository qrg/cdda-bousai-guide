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
    `./${SRC_DIR}/renderer/index.js`,
    `./${SRC_DIR}/renderer/styles/index.js`
  ],

  output: {
    ...baseConfig.output,
    path: `./${DIST_DIR}/renderer`,
    publicPath: `http://localhost:${PORT}/dist`
  },

  module: {
    ...baseConfig.module,
    loaders: [
      ...baseConfig.module.loaders,
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(sass|scss)$/,
        loader: 'style-loader!css-loader!sass-loader'
      }
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
  devtool: 'inline-source-map',

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
