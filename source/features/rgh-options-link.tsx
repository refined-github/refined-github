/* You can have invisible/inactive links to the options page on the wiki. This feature enables them. */
/* Use this HTML in a markdown document: <a name="options-page-link">options page</a> */
import delegate from 'delegate-it';

import features from '../feature-manager.js';
import openOptions from '../helpers/open-options.js';
import observe from '../helpers/selector-observer.js';
import {isRefinedGitHubRepo} from '../github-helpers/index.js';

const placeholdersSelector = 'a[name="user-content-options-page-link"]';

function linkify(anchor: HTMLAnchorElement): void {
	// This makes the anchor visible and clickable
	anchor.href = '#refined-github-options';
}

function init(signal: AbortSignal): void {
	observe(placeholdersSelector, linkify, {signal});
	delegate(placeholdersSelector, 'click', openOptions, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRefinedGitHubRepo,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/wiki

*/
