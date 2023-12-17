import {parseHTML, NodeFilter} from 'linkedom';

const globals = [
	'navigator',
	'document',
	'HTMLAnchorElement',
	'DocumentFragment',
	'Node',

	// Use JSDOM’s implementation because Node’s uses `pathname`’s accessors while the browser doesn’t
	'URL',
];

const {window} = parseHTML('...', 'text/html');
globalThis.location = new URL('https://github.com');

for (const property of globals) {
	globalThis[property] = window[property];
}

class Location {}
globalThis.Location = Location;
globalThis.NodeFilter = NodeFilter;
globalThis.location = new URL('https://github.com');

const link = document.createElement('link');
link.rel = 'alternate';
link.type = 'application/atom+xml';
navigateToCommits('master', '/refined-github/refined-github/commits');
document.head.append(link);

// eslint-disable-next-line import/prefer-default-export
export function navigateToCommits(branch, pathname) {
	link.href = `https://github.com/refined-github/refined-github/commits/${branch}.atom`;
	link.title = `Recent Commits to ava:${branch}`;
	location.pathname = pathname;
}

// No native support https://github.com/WebReflection/linkedom/issues/156
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
