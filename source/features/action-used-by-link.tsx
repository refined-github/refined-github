import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import SearchIcon from 'octicons-plain-react/Search';
import {$, $$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function getActionUrl(repoLink: HTMLAnchorElement): URL {
	const actionRepo = repoLink.pathname.slice(1);

	const actionUrl = new URL('search', location.origin);
	actionUrl.search = new URLSearchParams({
		q: `${actionRepo} path:.github/workflows/ language:YAML`,
		type: 'Code',
		s: 'indexed',
		o: 'desc',
	}).toString();

	return actionUrl;
}

function cleanElement(element: HTMLElement): void {
	for (const child of $$(['[id]', '[aria-labelledby]'], element)) {
		child.removeAttribute('id');
		child.removeAttribute('aria-labelledby');
	}
}

function addUsageLink(repoItem: HTMLElement): void {
	const usageItem = repoItem.cloneNode(true);
	cleanElement(usageItem);
	const usageLink = $('a', usageItem);
	usageLink.href = getActionUrl(usageLink).href;
	$('[data-component="ActionList.Item.Label"]', usageItem).textContent = 'Usage examples';
	$('[data-component="ActionList.LeadingVisual"]', usageItem).replaceChildren(<SearchIcon />);

	closestElement('ul', repoItem).append(usageItem);
}

function init(signal: AbortSignal): void {
	observe('[data-testid="resources"] [data-component="ActionList.Item"]:has(.octicon-repo)', addUsageLink, {signal});
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
