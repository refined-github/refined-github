import {JSDOM} from 'jsdom';

const globals = [
	'navigator',
	'document',
	'HTMLAnchorElement',
	'DocumentFragment',
	'NodeFilter',
	'Node',
	'Location',

	// Use JSDOM’s implementation because Node’s uses `pathname`’s accessors while the browser doesn’t
	'URL',
];

const {window} = new JSDOM('…');
globalThis.location = new URL('https://github.com');

for (const property of globals) {
	globalThis[property] = window[property];
}

document.head.insertAdjacentHTML('beforeend', '<link href="https://github.com/avajs/ava/commits/master.atom" rel="alternate" title="Recent Commits to ava:master" type="application/atom+xml">');
