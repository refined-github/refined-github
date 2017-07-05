const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		content: './src/content',
		background: './src/background',
		options: './src/options'
	},
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin()
	],
	output: {
		path: path.join(__dirname, 'extension'),
		filename: '[name].js'
	}
};
