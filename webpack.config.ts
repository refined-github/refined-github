/// <reference types="./source/globals" />

import path from 'node:path';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack, {Configuration} from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

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
	].map(name => [name, `./${name}`])),
	context: path.resolve('source'),
	output: {
		path: path.resolve('distribution'),
	},
	module: {
		rules: [
			{
				test: /[/\\]readme\.md$/,
				loader: '../build/readme.loader.cts',
			},
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
		new MiniCssExtractPlugin(),
		new webpack.ProvidePlugin({
			browser: 'webextension-polyfill',
		}),
		new CopyWebpackPlugin({
			patterns: [
				'*.+(html|json|png)',
			],
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

if (process.env.CI) {
	config.stats = {
		assets: true,
		entrypoints: true,
		chunks: true,
		modules: true,
	};
}

export default config;
