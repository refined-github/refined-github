/// <reference types="./source/globals" />

import path from 'path';
import {readdirSync, readFileSync} from 'fs';

import SizePlugin from 'size-plugin';
// @ts-expect-error
import {ESBuildPlugin} from 'esbuild-loader';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack, {Configuration} from 'webpack';

const readmeContent = readFileSync('readme.md', 'utf-8');

function stripLinks(markdownText: string): Partial<FeatureMeta> {
	const urls: string[] = [];
	const description = markdownText.replace(/\[(.+?)]\((.+?)\)/g, (_match, title, url) => {
		urls.push(url);
		return title;
	});

	return {
		description,
		screenshot: urls.find(url => url.startsWith('https://user-images.githubusercontent.com/')) ?? urls[0]
	};
}

function parseFeatureDetails(id: FeatureID): FeatureMeta {
	const feature: Partial<FeatureMeta> = {id};

	const lineRegex = new RegExp(`^- \\[\\]\\(# "${id}"\\)(?: 🔥)? (.+)$`, 'm');
	const lineMatch = lineRegex.exec(readmeContent);
	if (lineMatch) {
		Object.assign(feature, stripLinks(lineMatch[1]));
		feature.description = feature.description!
			.replace(/<code>\\`(.+?)\\`<\/code>/, '`$1`') // Simplify weird Markdown escaping
			.replace(/<kbd>(.+?)<\/kbd>/g, '`$1`'); // Replace keyboard shortcut tags
	} else {
		// Feature might be highlighted in the readme
		const imageRegex = new RegExp(`<p><a title="${id}"></a> (.+?)\\n\\t+<p><img src="(.+?)">`);
		const imageMatch = imageRegex.exec(readmeContent);
		if (imageMatch) {
			feature.description = `${imageMatch[1]}.`;
			feature.screenshot = imageMatch[2];
		} else {
			throw new Error(`❌ Feature \`${id}\` needs a description in readme.md. Please refer to the style guide there.`);
		}
	}

	const featureFileContent = readFileSync(`source/features/${id}.tsx`, {encoding: 'utf-8'});
	const [, disabledReason] = /\n\tdisabled: '([^\n]+)'/.exec(featureFileContent) ?? [];
	if (disabledReason) {
		feature.disabled = disabledReason;
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
