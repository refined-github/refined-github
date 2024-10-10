/* You can have invisible/inactive links to the options page on the wiki. This feature enables them. */
import delegate from 'delegate-it';

import features from '../feature-manager.js';
import openOptions from '../helpers/open-options.js';
import observe from '../helpers/selector-observer.js';

const issueUrl = 'https://github.com/refined-github/refined-github/wiki';
const placeholdersSelector = 'a[name="user-content-options-page-link"]';

function linkify(anchor: HTMLAnchorElement): void {
	anchor.href = '#refined-github-options';
}

function init(signal: AbortSignal): void {
	delegate(placeholdersSelector, 'click', openOptions, {signal});
	observe(placeholdersSelector, linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		() => location.href.startsWith(issueUrl),
	],
	awaitDomReady: true, // Small page
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/wiki

*/
