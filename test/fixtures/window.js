const url = require('url');

function WindowMock(initialURI) {
	this._currentURI = initialURI;
}

WindowMock.prototype.location = {
	set href(uri) {
		const uriParts = url.parse(uri);
		this.hostname = uriParts.hostname;
		this.pathname = uriParts.pathname;
		this._currentURI = uri;
	},

	get href() {
		return this._currentURI;
	}
};

module.exports = WindowMock;
