const {URL} = require('url');

function WindowMock(initialURI = 'https://github.com') {
	this.location = new URL(initialURI);
	this.navigator = {
		platform: 'test'
	};
}

module.exports = WindowMock;
