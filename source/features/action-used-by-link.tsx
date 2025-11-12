import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import SearchIcon from 'octicons-plain-react/Search';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function getActionURL(side: HTMLElement): URL {
	const actionRepo = $('a:has(.octicon-repo)', side)
		.pathname
		.slice(1);

	const actionURL = new URL('search', location.origin);
	actionURL.search = new URLSearchParams({
		q: `${actionRepo} path:.github/workflows/ language:YAML`,
		type: 'Code',
		s: 'indexed',
		o: 'desc',
	}).toString();

	return actionURL;
}

function addUsageLink(side: HTMLElement): void {
	const actionURL = getActionURL(side);

	// TODO: Integrate style better https://github.com/refined-github/refined-github/pull/8285/files#r1951911960
	side.after(<a href={actionURL.href} className='d-block mb-2'>
		<SearchIcon width={14} className='color-fg-default mr-2' />Usage examples
	</a>);
}

function init(signal: AbortSignal): void {
	observe('[data-testid="resources"] > ul', addUsageLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isMarketplaceAction,
	],
	init,
});

/*

Test URLs:

https://github.com/marketplace/actions/title-replacer

*/
