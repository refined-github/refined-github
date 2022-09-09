import {parseHTML, NodeFilter} from 'linkedom';

const {window} = parseHTML('<html><head></head><body>');

const globals = [
	'navigator',
	'document',
	'HTMLAnchorElement',
	'DocumentFragment',
	// 'NodeFilter',
	'Node',
	// 'Location',
	// Use JSDOM’s implementation because Node’s uses `pathname`’s accessors while the browser doesn’t
	'URL',
];

for (const property of globals) {
	globalThis[property] = window[property];
}

class Location {}

globalThis.Location = Location;
globalThis.NodeFilter = NodeFilter;
globalThis.location = new URL('https://github.com');

// TODO: Drop after https://github.com/WebReflection/linkedom/issues/156
window.Text.prototype.splitText = function (offset) {
	const [start, end] = (() => {
		if (offset <= 0) {
			return ['', this.data];
		}

		if (offset >= this.data.length) {
			return [this.data, ''];
		}

		return [
			this.data.slice(0, Math.max(0, offset)),
			this.data.slice(Math.max(0, offset)),
		];
	})();

	const newNode = window.document.createTextNode(end);
	this.parentNode.insertBefore(newNode, this.nextSibling);
	this.data = start;
	return newNode;
};

document.head.insertAdjacentHTML('beforeend', '<link href="https://github.com/avajs/ava/commits/master.atom" rel="alternate" title="Recent Commits to ava:master" type="application/atom+xml">');
