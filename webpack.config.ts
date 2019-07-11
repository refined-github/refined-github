/// <reference types="./source/globals" />

import path from 'path';
import {readdirSync, readFileSync} from 'fs';
import webpack from 'webpack';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

function parseFeatureDetails(name: string): FeatureInfo {
	const content = readFileSync(`source/features/${name}.tsx`, {encoding: 'utf-8'});
	const fields = ['disabled', 'description', 'screenshot'] as const;

	const feature: Partial<FeatureInfo> = {name};
	for (const field of fields) {
		const [, value]: string[] | [] = new RegExp(`\n\t${field}: '([^\\n]+)'`).exec(content) || [];
		if (value) {
			feature[field] = value;
		} else if (field === 'description') {
			throw new Error(`Description wasn't found in the \`${name}\` feature`);
		}
	}

	return feature as FeatureInfo;
}

const features = readdirSync(path.join(__dirname, 'source/features'))
	.filter(filename => filename.endsWith('.tsx'))
	.map(filename => filename.replace('.tsx', ''));

module.exports = (_env: string, argv: Record<string, boolean | number | string>): webpack.Configuration => ({
	devtool: 'source-map',
	stats: {
		all: false,
		errors: true,
		builtAt: true
	},
	entry: {
		content: './source/content',
		background: './source/background',
		options: './source/options',
		'resolve-conflicts': './source/resolve-conflicts'
	},
	output: {
		path: path.join(__dirname, 'distribution'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						query: {
							compilerOptions: {
								// Enables ModuleConcatenation. It must be in here to avoid conflict with ts-node
								module: 'es2015',

								// With this, TS will error but the file will still be generated (on watch only)
								noEmitOnError: argv.watch === false
							},

							// Make compilation faster with `fork-ts-checker-webpack-plugin`
							transpileOnly: true
						}
					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			}
		]
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin(),
		new webpack.DefinePlugin({
			// These aren't dynamic because `runtimeValue` doesn't update when "any" file updates, but only when the files with these variables update — which is not very useful.
			__featuresList__: JSON.stringify(features),
			__featuresInfo__: JSON.stringify(features.map(parseFeatureDetails)),

			// @ts-ignore
			__featureName__: webpack.DefinePlugin.runtimeValue(({module}) => {
				return JSON.stringify(path.basename(module.resource, '.tsx'));
			})
		}),
		new MiniCssExtractPlugin({
			filename: 'content.css'
		}),
		new SizePlugin(),
		new CopyWebpackPlugin([
			{
				from: '*',
				context: 'source',
				ignore: [
					'*.js',
					'*.ts',
					'*.tsx',
					'*.css'
				]
			},
			{
				from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
			}
		])
	],
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		]
	},
	optimization: {
		// Without this, function names will be garbled and enableFeature won't work
		concatenateModules: true,

		// Automatically enabled on production; keeps it somewhat readable for AMO reviewers
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					mangle: false,
					compress: false,
					output: {
						beautify: true,
						indent_level: 2 // eslint-disable-line @typescript-eslint/camelcase
					}
				}
			})
		]
	}
});
