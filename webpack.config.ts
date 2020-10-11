/// <reference types="./source/globals" />

import path from 'path';
import {readdirSync, readFileSync} from 'fs';

import stripIndent from 'strip-indent';
import webpack, {Configuration} from 'webpack';
import SizePlugin from 'size-plugin';
// @ts-expect-error
import {ESBuildPlugin} from 'esbuild-loader';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
	entry: Object.fromEntries([
		'refined-github',
		'background',
		'options',
		'resolve-conflicts'
	].map(name => [name, `./source/${name}`])),
	output: {
		path: path.resolve('distribution')
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'es2019'
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
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
		new ESBuildPlugin(),
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__featuresOptionDefaults__: webpack.DefinePlugin.runtimeValue(
				() => JSON.stringify(Object.fromEntries(getFeatures().map(id => [`feature:${id}`, true]))),
				true
			),

			__featuresMeta__: webpack.DefinePlugin.runtimeValue(
				() => JSON.stringify(getFeatures().map(parseFeatureDetails)),
				true
			),

			__filebasename: webpack.DefinePlugin.runtimeValue(
				// @ts-expect-error due to https://github.com/webpack/webpack/issues/10757
				info => JSON.stringify(path.parse(info.module.resource).name)
			)
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: 'source',
					globOptions: {
						ignore: [
							'**/*.js',
							'**/*.ts',
							'**/*.tsx',
							'**/*.css'
						]
					}
				},
				{
					from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
				}
			]
		}),
		new SizePlugin({
			writeFile: false
		})
	],
	resolve: {
		alias: {
			octicon: '@primer/octicons-v2/build/svg'
		},
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		]
	}
};

export default config;
