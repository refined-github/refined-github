import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import SearchIcon from 'octicons-plain-react/Search';
import {$, $$, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function getActionUrl(side: HTMLElement): URL {
	const actionRepo = $('a:has(.octicon-repo)', side)
		.pathname
		.slice(1);

	const actionUrl = new URL('search', location.origin);
	actionUrl.search = new URLSearchParams({
		q: `${actionRepo} path:.github/workflows/ language:YAML`,
		type: 'Code',
		s: 'indexed',
		o: 'desc',
	}).toString();

	return actionUrl;
}

function addUsageLink(resourcesList: HTMLElement): void {
	const actionUrl = getActionUrl(resourcesList);
	const sourceLink = $('a:has(.octicon-repo)', resourcesList);
	const usageItem = closestElement('[data-component="ActionList.Item"]', sourceLink).cloneNode(true);
	const usageLink = $('a', usageItem);
	const label = $('[data-component="ActionList.Item.Label"]', usageItem);
	const leadingVisual = $('[data-component="ActionList.LeadingVisual"]', usageItem);
	const trailingVisual = $('[data-component="ActionList.TrailingVisual"]', usageItem);

	for (const element of $$('[id]', usageItem)) {
		element.removeAttribute('id');
	}

	usageLink.removeAttribute('aria-labelledby');
	usageLink.href = actionUrl.href;
	usageLink.classList.add('rgh-action-used-by-link');
	label.textContent = 'Usage examples';
	leadingVisual.replaceChildren(<SearchIcon width={16} />);
	trailingVisual.textContent = '';

	resourcesList.append(usageItem);
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
