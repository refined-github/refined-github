/// <reference types="./source/globals" />

import path from 'path';
import { readdirSync, readFileSync } from 'fs';

import stripIndent from 'strip-indent';
import webpack, { Configuration } from 'webpack';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import InertEntryPlugin from 'inert-entry-webpack-plugin';

function parseFeatureDetails(id: FeatureID): FeatureMeta {
	const content = readFileSync(`source/features/${id}.tsx`, {encoding: 'utf-8'});
	const fields = ['disabled', 'description', 'screenshot'] as const;

	const feature: Partial<FeatureMeta> = {id};
	for (const field of fields) {
		const value = new RegExp(`\n\t${field}: '([^\\n]+)'`).exec(content)?.[1];
		if (value) {
			const validValue = value.trim().replace(/\\'/g, '’'); // Catch trailing spaces and incorrect apostrophes
			if (value !== validValue) {
				throw new Error(stripIndent(`
					❌ Invalid characters found in \`${id}\`. Apply this patch:

					- ${field}: '${value}'
					+ ${field}: '${validValue}'
				`));
			}

			feature[field] = value.replace(/\\\\/g, '\\');
		}
	}

	return feature as FeatureMeta;
}

function getFeatures(): FeatureID[] {
	return readdirSync(path.join(__dirname, 'source/features'))
		.filter(filename => filename !== 'index.tsx' && filename.endsWith('.tsx'))
		.map(filename => filename.replace('.tsx', '') as FeatureID);
}

const config: Configuration = {
	devtool: 'source-map',
	stats: {
		all: false,
		errors: true,
		builtAt: true
	},
	context: path.resolve(__dirname, './source'),
	entry: './manifest.json',
	output: {
		publicPath: '/',
		path: path.join(__dirname, 'distribution'),
		filename: 'manifest.json'
	},
	module: {
		rules: [
			{
				type: 'javascript/auto', // Prevent json-loader
				test: /manifest\.json$/,
				use: [
					'extract-loader',
					{
						loader: 'webextension-manifest-loader',
						options: {
							targetVendor: 'chrome'
						}
					}
				]
			},
			{
				resourceQuery: /entry/,
				exclude: /\.html/,
				loader: 'spawn-loader?name=[name].js'
			},
			{
				test: /\.html$/,
				resourceQuery: /entry/,
				use: ['file-loader?name=[name].html', 'extract-loader', 'html-loader']
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
					compilerOptions: {
						// Enables ModuleConcatenation. It must be in here to avoid conflict with ts-node when it runs this file
						module: 'es2015'
					}
				},
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				oneOf: [
					{
						issuer: /\.tsx?$/,
						use: [
							{
								loader: 'style-loader',
								options: {
									insert: function insertAtTop(element: HTMLStyleElement) {
										document.onreadystatechange = function () {
											if (document.readyState === 'interactive') {
												var parent = document.querySelector('head')!;
												// @ts-ignore
												var lastInsertedElement = window._lastElementInsertedByStyleLoader;
												if (!lastInsertedElement) {
													parent.insertBefore(element, parent.firstChild);
												} else if (lastInsertedElement.nextSibling) {
													parent.insertBefore(
														element,
														lastInsertedElement.nextSibling
													);
												} else {
													parent.appendChild(element);
												}
												// @ts-ignore
												window._lastElementInsertedByStyleLoader = element;
											}
										}
									}
								}
							},
							'css-loader'
						]
					},
					{
						use: ['file-loader?name=[name].[ext]', 'extract-loader', 'css-loader']
					}
				]
			},
			{
				test: /\.png$/,
				use: ['file-loader?name=[name].[ext]', 'img-loader']
			},
			{
				test: /\.svg$/i,
				use: [
					// Converts SVG files into a `export default () => actualDomElement`
					path.resolve(__dirname, 'octicon-svg-loader.ts')
				]
			}
		]
	},
	plugins: [
		new InertEntryPlugin(),
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__featuresOptionDefaults__: webpack.DefinePlugin.runtimeValue(() => {
				return JSON.stringify(Object.fromEntries(getFeatures().map(id => [`feature:${id}`, true])));
				// TODO: unignore after https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42036
				// @ts-expect-error
			}, true),

			__featuresMeta__: webpack.DefinePlugin.runtimeValue(() => {
				return JSON.stringify(getFeatures().map(parseFeatureDetails));
				// @ts-expect-error
			}, true),

			__filebasename: webpack.DefinePlugin.runtimeValue(({module}) => {
				// @ts-expect-error
				return JSON.stringify(path.basename(module.resource).replace(/\.tsx?$/, ''));
			})
		}),
		new SizePlugin({
			writeFile: false
		})
	],
	resolve: {
		alias: {
			octicon: '@primer/octicons-v2/build/svg'
		},
		extensions: ['.tsx', '.ts', '.js']
	},
	optimization: {
		// Automatically enabled on production;
		// Keeps it somewhat readable for AMO reviewers
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					mangle: false,
					compress: {
						defaults: false,
						dead_code: true,
						unused: true,
						arguments: true,
						join_vars: false,
						booleans: false,
						expression: false,
						sequences: false
					},
					output: {
						beautify: true,
						indent_level: 2
					}
				}
			})
		]
	}
};

export default config;
