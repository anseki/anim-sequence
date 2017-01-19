/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  BUILD = process.env.NODE_ENV === 'production',
  PKG = require('./package'),

  BABEL_TARGET_PACKAGES = [
  ].map(packageName => path.resolve(__dirname, `node_modules/${packageName}`) + path.sep),

  BABEL_PARAMS = {
    presets: ['es2015'],
    plugins: ['add-module-exports']
  };

module.exports = {
  entry: './src/anim-sequence.js',
  output: {
    path: BUILD ? __dirname : path.join(__dirname, 'test'),
    filename: BUILD ? 'anim-sequence.min.js' : 'anim-sequence.js',
    library: 'AnimSequence',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: absPath => !BABEL_TARGET_PACKAGES.find(target => absPath.indexOf(target) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        use: BUILD ? [
          {
            loader: 'babel-loader',
            options: BABEL_PARAMS
          },
          {
            loader: 'skeleton-loader',
            options: {
              procedure: content => (content + '')
                .replace(/[^\n]*\[DEBUG\/\][^\n]*\n?/g, '')
                .replace(/\/\*\s*\[DEBUG\]\s*\*\/[\s\S]*?\/\*\s*\[\/DEBUG\]\s*\*\//g, '')
                .replace(/[^\n]*\[DEBUG\][\s\S]*?\[\/DEBUG\][^\n]*\n?/g, '')
            }
          }
        ] : [
          {
            loader: 'babel-loader',
            options: BABEL_PARAMS
          }
        ]
      }
    ]
  },
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin({raw: true,
      banner: `/*! ${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage} */`})
  ] : []
};
