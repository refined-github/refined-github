'use strict';
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, argv) => ({
	mode: 'production', // Without this, function names will be garbled and enableFeature won't work
	entry: {
		content: './source/content',
		background: './source/background',
		options: './source/options'
	},
	output: {
		path: path.join(__dirname, 'distribution'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{
				from: '*',
				context: 'source',
				ignore: '*.js'
			},
			{
				from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
			}
		])
	],
	optimization: {
		minimize: false,
		minimizer: argv.watch ? [] : [
			new UglifyJsPlugin({
				uglifyOptions: {
					// Keep it somewhat readable for AMO reviewers
					mangle: false,
					compress: false,
					output: {
						beautify: true,

						// Reduce beautification indentation from 4 spaces to 1 to save space
						indent_level: 2 // eslint-disable-line camelcase
					}
				}
			})
		]
	}
});
