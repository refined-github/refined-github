/// <reference types="./source/globals" />

import path from 'path';
import {readdirSync, readFileSync} from 'fs';
import webpack, {Configuration} from 'webpack';
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
		const value = new RegExp(`\n\t${field}: '([^\\n]+)'`).exec(content)?.[1];
		if (value) {
			const validValue = value.trim().replace(/\\'/g, '’'); // Catch trailing spaces and incorrect apostrophes
			if (value !== validValue) {
				throw new Error(`
Invalid characters found in \`${name}\`. Apply this patch:

- ${field}: '${value}'
+ ${field}: '${validValue}'
`);
			}

			feature[field] = value.replace(/\\\\/g, '\\');
		} else if (field === 'description') {
			throw new Error(`Description wasn't found in the \`${name}\` feature`);
		}
	}

	return feature as FeatureInfo;
}

function getFeatures(): string[] {
	return readdirSync(path.join(__dirname, 'source/features'))
		.filter(filename => filename.endsWith('.tsx'))
		.map(filename => filename.replace('.tsx', ''));
}

const config: Configuration = {
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
								module: 'es2015'
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
			},
			{
				// Allows us to import SVG as JSX modules
				test: /\.svg$/i,
				use: [
					'buble-loader', // Converts JSX to vanilla `React.createElement` calls because TypeScript can't handle JSX outside jsx/tsx files: https://github.com/microsoft/TypeScript/issues/10939
					path.resolve(__dirname, 'octicon-svg-loader.ts') // Converts the SVG file into a JSX module with default export
				]
			}
		]
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin(),
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__featuresOptionDefaults__: webpack.DefinePlugin.runtimeValue(() => {
				return JSON.stringify(getFeatures().reduce((defaults, feature) => {
					defaults[`feature:${feature}`] = true;
					return defaults;
				}, {} as AnyObject));
				// TODO: unignore after https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42036
				// @ts-ignore
			}, true),

			__featuresInfo__: webpack.DefinePlugin.runtimeValue(() => {
				return JSON.stringify(getFeatures().map(parseFeatureDetails));
				// @ts-ignore
			}, true),

			__featureName__: webpack.DefinePlugin.runtimeValue(({module}) => {
				// @ts-ignore
				return JSON.stringify(path.basename(module.resource, '.tsx'));
			})
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new SizePlugin({
			writeFile: false
		}),
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
		alias: {
			octicon: '@primer/octicons/build/svg'
		},
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
};

export default config;
