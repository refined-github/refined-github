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

const link = document.createElement('link');
link.rel = 'alternate';
link.type = 'application/atom+xml';
navigateToBranch('master');
document.head.append(link);

// eslint-disable-next-line import/prefer-default-export
export function navigateToBranch(branch) {
	link.href = `https://github.com/avajs/ava/commits/${branch}.atom`;
	link.title = `Recent Commits to ava:${branch}`;
}
