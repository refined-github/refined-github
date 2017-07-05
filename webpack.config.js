const path = require('path');

module.exports = {
	entry: {
		content: './src/content',
		background: './src/background',
		options: './src/options'
	},
	output: {
		path: path.join(__dirname, 'extension'),
		filename: '[name].js'
	}
};
