'use strict';
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		content: './source/content',
		background: './source/background',
		options: './source/options'
	},
	plugins: [
		new webpack.DefinePlugin({
			process: '0'
		}),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CopyWebpackPlugin([{
			from: '*',
			context: 'source',
			ignore: '*.js'
		}, {
			from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
		}])
	],
	output: {
		path: path.join(__dirname, 'distribution'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	}
};

if (process.env.NODE_ENV === 'production') {
	module.exports.plugins.push(
		new UglifyJSPlugin({
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
	);
} else {
	module.exports.devtool = 'source-map';
}
