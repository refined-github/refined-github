import path from 'path';
import {readdirSync, readFileSync} from 'fs';
import webpack from 'webpack';
import SizePlugin from 'size-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

function getFeatureList(): string[] {
	// List of filenames like ['ci-link.tsx', 'show-names.tsx', ...]
	const files =  readdirSync(path.join(__dirname, 'source/features'));
	const list: string[] = [];
	for (const file of files) {
		if (file.endsWith('.tsx')) {
			list.push(file.replace('.tsx', ''));
		}
	}
	return list;
}

function parseFeatureDetails(name: string): FeatureInfo {
	const fullPath = path.join(__dirname, 'source/features', `${name}.tsx`);

	const content = readFileSync(fullPath, {encoding: 'utf-8'});

	const fields = ['description', 'screenshot', 'disabled'] as const;
	const feature: Partial<FeatureInfo> = {name};

	// Use named groups if Firefox ever supports them: https://bugzilla.mozilla.org/show_bug.cgi?id=1362154
	for (const field of fields) {
		const [, value = undefined] = new RegExp(`${field}: '([^\\n]+)'`).exec(content) || [];
		if (value) {
			feature[field] = value.replace('\\\'', '\'');
		}
	}

	return feature as FeatureInfo;
}

const features = getFeatureList();

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
		new webpack.DefinePlugin({
			// These aren't dynamic because `runtimeValue` doesn't update when "any" file updates, but only when the files with these variables update — which is not very useful.
			__featuresList__: JSON.stringify(features),
			__featuresInfo__: JSON.stringify(features.map(parseFeatureDetails)),

			// @ts-ignore
			__featureName__: webpack.DefinePlugin.runtimeValue(({module}) => {
				return JSON.stringify(path.basename(module.resource, '.tsx'));
			})
		}),
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
