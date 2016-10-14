'use strict';

import webpack from 'webpack';
import baseConfig from './base.babel';
import {SRC_DIR, DIST_DIR} from '../path-config';

export default {
  ...baseConfig,

  entry: [
    `./${SRC_DIR}/main/index`
  ],

  output: {
    ...baseConfig.output,
    path: `./${DIST_DIR}/main`,
  },

  module: {
    ...baseConfig.module,
    noParse: [
      /devtron/,
      /electron-devtools-installer/
    ],
    loaders: [
      ...baseConfig.module.loaders,
      {
        test: /JSONStream\/index\.js/,
        loader: 'shebang!source-map-loader!babel-loader'
      }
    ]
  },

  plugins: [
    // Minify the output
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),

    // Add source map support for stack traces in node
    // https://github.com/evanw/node-source-map-support
    /*new webpack.BannerPlugin(
      'require("source-map-support").install();',
      {raw: true, entryOnly: false}
    ),*/

    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurrenceOrderPlugin(),

    // NODE_ENV should be production so that modules do not perform certain development checks
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ],

  // https://webpack.github.io/docs/configuration.html#target
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-main',

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }/*,

  externals: [
    'font-awesome',
    'source-map-support'
  ]*/
};
