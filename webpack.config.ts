/// <reference types="./source/globals" />

import path from 'path';
import {readFileSync} from 'fs';

import regexJoin from 'regex-join';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, {Configuration} from 'webpack';
import {parse as parseMarkdown} from 'markdown-wasm/dist/markdown.node.js';

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

	throwError(id, 'needs a description in readme.md. Please refer to the style guide there');

	return {} as any;
}

function getFeatures(): FeatureID[] {
	const contents = readFileSync(path.join(__dirname, 'source/refined-github.ts'), 'utf-8');
	return [...contents.matchAll(/^import '\.\/features\/([^.]+)';/gm)]
		.map(match => match[1] as FeatureID)
		.sort();
}

function throwError(id: string, error: string): void {
	const errorMessage = `❌ \`${id}\` → ${error}`;
	if (!isWatching) {
		throw new Error(errorMessage);
	}

	console.error(errorMessage);
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
		new webpack.DefinePlugin({
			// Passing `true` as the second argument makes these values dynamic — so every file change will update their value.
			__features__: webpack.DefinePlugin.runtimeValue(
				() => JSON.stringify(getFeatures()),
				true
			),

			__featuresMeta__: webpack.DefinePlugin.runtimeValue(
				() => {
					const readmeContent = readFileSync(path.join(__dirname, 'readme.md'), 'utf-8');
					const featuresWithMeta = getFeatures()
						.filter(id => !id.startsWith('rgh-'))
						.map(id => parseFeatureDetails(readmeContent, id));
					return JSON.stringify(featuresWithMeta);
				},
				true
			),

			__filebasename: webpack.DefinePlugin.runtimeValue(
				info => {
					const fileInfo = path.parse(info.module.resource);
					if (fileInfo.ext !== '.tsx') {
						throwError(fileInfo.name, `has a ${fileInfo.ext} extension but should be .tsx`);

						return JSON.stringify(fileInfo.name);
					}

					return JSON.stringify(fileInfo.name);
				}
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
