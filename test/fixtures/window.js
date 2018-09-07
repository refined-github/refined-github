const {URL} = require('url');

function WindowMock(initialURI = 'https://github.com') {
	this.location = new URL(initialURI);
}

module.exports = WindowMock;
