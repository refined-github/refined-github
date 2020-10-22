/// <reference types="./source/globals" />

import path from 'path';
import {readFileSync} from 'fs';

import SizePlugin from 'size-plugin';
// @ts-expect-error
import {ESBuildPlugin} from 'esbuild-loader';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, {Configuration} from 'webpack';

const readmeContent = readFileSync(path.join(__dirname, 'readme.md'), 'utf-8');

function parseFeatureDetails(id: FeatureID): FeatureMeta {
	const lineRegex = new RegExp(`^- \\[\\]\\(# "${id}"\\)(?: 🔥)? (.+)$`, 'm');
	const lineMatch = lineRegex.exec(readmeContent);
	if (lineMatch) {
		const urls: string[] = [];

		return {
			id,
			description: lineMatch[1].replace(/\[(.+?)]\((.+?)\)/g, (_match, title, url) => {
				urls.push(url);
				return title;
			}),
			screenshot: urls.find(url => /\.(png|gif)$/i.test(url))
		};
	}

	// Feature might be highlighted in the readme
	const imageRegex = new RegExp(`<p><a title="${id}"></a> (.+?)\\n\\t+<p><img src="(.+?)">`);
	const imageMatch = imageRegex.exec(readmeContent);
	if (imageMatch) {
		return {
			id,
			description: `${imageMatch[1]}.`,
			screenshot: imageMatch[2]
		};
	}

	throw new Error(`❌ Feature \`${id}\` needs a description in readme.md. Please refer to the style guide there.`);
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
