/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'anim-sequence',
  OBJECT_NAME = 'AnimSequence',

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  RULES = require('./webpack.config.rules.js'),

  BUILD = process.env.NODE_ENV === 'production',

  ENTRY_PATH = path.resolve(__dirname, 'src', `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${BUILD ? '.min' : ''}.js`;

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
    libraryTarget: 'var'
  },
  module: {rules: RULES},
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
