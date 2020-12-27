/// <reference types="./source/globals" />

import path from 'path';
import {readFileSync} from 'fs';

import regexJoin from 'regex-join';
import SizePlugin from 'size-plugin';
import decamelize from 'decamelize';
import TerserPlugin from 'terser-webpack-plugin';

import {ESBuildPlugin} from 'esbuild-loader';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, {Configuration} from 'webpack';
import {parse as parseMarkdown} from 'markdown-wasm/dist/markdown.node';

let isWatching = false;

function parseFeatureDetails(readmeContent: string, id: FeatureID): FeatureMeta {
	const lineRegex = regexJoin(/^/, `- [](# "${id}")`, /(?: 🔥)? (.+)$/m);
	const lineMatch = lineRegex.exec(readmeContent);
	if (lineMatch) {
		const urls: string[] = [];

		return {
			id,
			description: parseMarkdown(lineMatch[1].replace(/\[(.+?)]\((.+?)\)/g, (_match, title, url) => {
				urls.push(url);
				return title;
			})),
			screenshot: urls.find(url => /\.(png|gif)$/i.test(url))
		};
	}

	// Feature might be highlighted in the readme
	const imageRegex = regexJoin(`<p><a title="${id}"></a> `, /(.+?)\n\t+<p><img src="(.+?)">/);
	const imageMatch = imageRegex.exec(readmeContent);
	if (imageMatch) {
		return {
			id,
			description: parseMarkdown(imageMatch[1] + '.'),
			screenshot: imageMatch[2]
		};
	}

	const error = `

	❌ Feature \`${id}\` needs a description in readme.md. Please refer to the style guide there.

	`;
	if (isWatching) {
		console.error(error);
		return {} as any;
	}

	throw new Error(error);
}

function getFeatures(): FeatureID[] {
	return Array.from(
		readFileSync(path.join(__dirname, 'source/refined-github.ts'), 'utf-8').matchAll(/^import '\.\/features\/([^.]+)';/gm),
		match => match[1] as FeatureID
	).sort();
}

const config: Configuration = {
	devtool: 'source-map',
	stats: {
		all: false,
		errors: true
	},
	entry: Object.fromEntries([
		'refined-github',
		'background',
		'options',
		'resolve-conflicts'
	].map(name => [name, `./source/${name}`])),
	output: {
		path: path.resolve('distribution/build')
	},
	module: {
		rules: [
			{
				test: /octicons-react\//,
				loader: 'string-replace-loader',
				options: {
					search: /(\w+)Icon\.defaultProps = {\n\s+className: 'octicon'/g,
					replace: (match: string, name: string) => {
						return match.replace('octicon', 'octicon octicon-' + decamelize(name, '-'));
					}
				}
			},
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'es2020'
				}
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
		new ESBuildPlugin(),
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__featuresOptionDefaults__: webpack.DefinePlugin.runtimeValue(
				() => JSON.stringify(Object.fromEntries(getFeatures().map(id => [`feature:${id}`, true]))),
				true
			),

			__featuresMeta__: webpack.DefinePlugin.runtimeValue(
				() => {
					const readmeContent = readFileSync(path.join(__dirname, 'readme.md'), 'utf-8');
					return JSON.stringify(getFeatures().map(id => parseFeatureDetails(readmeContent, id)));
				},
				true
			),

			__filebasename: webpack.DefinePlugin.runtimeValue(
				// @ts-expect-error
				info => JSON.stringify(path.parse(info.module.resource).name)
			)
		}),
		new MiniCssExtractPlugin(),
		new CopyWebpackPlugin({
			patterns: [{
				from: require.resolve('webextension-polyfill')
			}]
		}),
		new SizePlugin({writeFile: false})
	],
	resolve: {
		alias: {
			react: 'dom-chef'
		},
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		]
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
						indent_level: 2
					}
				}
			})
		]
	}
};

const webpackSetup = (_: string, options: webpack.WebpackOptionsNormalized): Configuration => {
	isWatching = Boolean(options.watch);
	return config;
};

export default webpackSetup;
