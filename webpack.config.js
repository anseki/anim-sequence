/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  buildMode = require('yargs').argv.mode === 'build',
  PKG = require('./package'),

  BABEL_TARGET_PACKAGES = [
  ].map(packageName => path.resolve(__dirname, `node_modules/${packageName}`) + path.sep),

  BABEL_PARAMS = JSON.stringify({
    presets: ['es2015'],
    plugins: ['add-module-exports']
  });

module.exports = {
  entry: './src/anim-sequence.js',
  output: {
    path: buildMode ? __dirname : path.join(__dirname, 'test'),
    filename: buildMode ? 'anim-sequence.min.js' : 'anim-sequence.js',
    library: 'AnimSequence',
    libraryTarget: 'var'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: absPath =>
          !BABEL_TARGET_PACKAGES.find(target => absPath.indexOf(target) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        loaders: buildMode ? [`babel?${BABEL_PARAMS}`, 'skeleton?config=js'] : [`babel?${BABEL_PARAMS}`]
      }
    ]
  },

  js: {
    procedure: function(content) {
      return (content + '')
        .replace(/[^\n]*\[DEBUG\/\][^\n]*\n?/g, '')
        .replace(/\/\*\s*\[DEBUG\]\s*\*\/[\s\S]*?\/\*\s*\[\/DEBUG\]\s*\*\//g, '')
        .replace(/[^\n]*\[DEBUG\][\s\S]*?\[\/DEBUG\][^\n]*\n?/g, '');
    }
  },

  devtool: buildMode ? null : 'source-map',
  plugins: buildMode ? [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.BannerPlugin(
      `/*! ${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage} */`,
      {raw: true})
  ] : null
};
