import path from 'path';
import {readdirSync} from 'fs';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import SizePlugin from 'size-plugin';

module.exports = (_env: string, argv: Record<string, boolean | number | string>): webpack.Configuration => ({
	devtool: 'source-map',
	stats: 'errors-only',
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
				test: /options-storage/,
				loader: 'string-replace-loader',
				options: {
					search: '__featuresList__',
					replace: (() => {
						const features = [];

						const directoryPath = path.join(__dirname, 'source/features');
						for (const filename of readdirSync(directoryPath)) {
							if (filename.endsWith('.tsx')) {
								features.push(filename.replace('.tsx', ''));
							}
						}

						return JSON.stringify(features);
					})()
				}
			},
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
							}
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
		new MiniCssExtractPlugin({
			filename: 'features.css'
		}),
		new SizePlugin(),
		new CopyWebpackPlugin([
			{
				from: '*',
				context: 'source',
				ignore: [
					'*.js',
					'*.ts',
					'*.tsx'
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
