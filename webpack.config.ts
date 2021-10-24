/// <reference types="./source/globals" />

import path from 'node:path';
import {createRequire} from 'node:module';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, {Configuration} from 'webpack';

import {getFeatures, getFeaturesMeta} from './build/readme-parser.js';

const {resolve: resolvePackage} = createRequire(import.meta.url);

const config: Configuration = {
	devtool: 'source-map',
	stats: {
		all: false,
		errors: true,
	},
	entry: Object.fromEntries([
		'refined-github',
		'background',
		'options',
		'resolve-conflicts',
	].map(name => [name, `./source/${name}`])),
	output: {
		path: path.resolve('distribution/build'),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'es2020',
				},
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
				],
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__features__: webpack.DefinePlugin.runtimeValue(() => JSON.stringify(getFeatures()), true),
			__featuresMeta__: webpack.DefinePlugin.runtimeValue(() => JSON.stringify(getFeaturesMeta()), true),
			__filebasename: webpack.DefinePlugin.runtimeValue(info => JSON.stringify(path.parse(info.module.resource).name)),
		}),
		new MiniCssExtractPlugin(),
		new CopyWebpackPlugin({
			patterns: [{
				from: resolvePackage('webextension-polyfill'),
			}],
		}),
		new SizePlugin({writeFile: false}),
	],
	resolve: {
		alias: {
			react: 'dom-chef',
		},
		extensions: [
			'.tsx',
			'.ts',
			'.js',
		],
	},
	optimization: {
		// Keeps it somewhat readable for AMO reviewers
		minimizer: [
			new TerserPlugin({
				parallel: true,
				exclude: 'browser-polyfill.min.js', // #3451
				terserOptions: {
					mangle: false,
					output: {
						beautify: true,
						indent_level: 2,
					},
				},
			}),
		],
	},
};

export default config;
