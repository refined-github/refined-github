const URL = require('url').URL;

function WindowMock(initialURI = 'https://github.com') {
	this.location = new URL(initialURI);
}

module.exports = WindowMock;
