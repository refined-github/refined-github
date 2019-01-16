const {URL} = require('url');

module.exports = function (initialURI = 'https://github.com') {
	this.location = new URL(initialURI);
	this.navigator = {
		platform: 'test'
	};
};
