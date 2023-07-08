/// <reference types="./source/globals.js" />

import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack, {Configuration} from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config: Configuration = {
	devtool: false, // Only inline source maps work in extensions, but they would slow down the extension for everyone
	stats: {
		preset: 'errors-warnings',
		entrypoints: true,
		timings: true,
	},
	performance: {
		hints: false,
	},
	entry: Object.fromEntries([
		'refined-github',
		'background',
		'options',
		'resolve-conflicts',
	].map(name => [name, `./${name}.js`])),
	context: path.resolve('source'),
	output: {
		path: path.resolve('distribution/assets'),
	},
	module: {
		rules: [
			{
				test: /\.gql/,
				type: 'asset/source',
			},
			{
				test: /[/\\]readme\.md$/,
				loader: '../build/readme.loader.ts',
			},
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'es2022',
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
		new MiniCssExtractPlugin(),
		new webpack.ProvidePlugin({
			browser: 'webextension-polyfill',
		}),
		new CopyWebpackPlugin({
			patterns: [{
				// Keep only the manifest in the root
				from: 'manifest.json',
				to: '..',
			}, {
				from: '*.+(html|png)',
			}],
		}),
	],
	resolve: {
		alias: {
			react: 'dom-chef',
		},
		extensions: [
			'.js',
		],
		extensionAlias: {
			// Explanation: https://www.npmjs.com/package/resolve-typescript-plugin
			'.js': ['.ts', '.tsx', '.js'],
		},
	},
	optimization: {
		// Keeps it somewhat readable
		minimizer: [
			new TerserPlugin({
				parallel: false, // https://github.com/esbuild-kit/tsx/issues/87#issuecomment-1226117760
				terserOptions: {
					mangle: false,
					compress: {
						sequences: false,
						conditionals: false,
					},
					output: {
						beautify: true,
						indent_level: 2,
					},
				},
			}),
		],
	},
};

if (process.env.CI) {
	config.stats = {
		assets: true,
		entrypoints: true,
		chunks: true,
		modules: true,
	};
}

export default config;
