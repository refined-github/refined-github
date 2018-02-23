'use strict';
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
	mode: isProd ? 'production' : 'development',
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
		minimizer: isProd ? [
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
		] : []
	}
};
