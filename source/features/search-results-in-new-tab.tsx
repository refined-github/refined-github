import type {DelegateEvent} from 'delegate-it';

import onAlteredClick from '../helpers/on-altered-click.js';
import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';

function getSearchResultUrl(item: HTMLElement): string {
	const {href} = item.dataset;
	if (!href) {
		throw new Error('Expected the search result item to have the `data-href` attribute');
	}

	return href;
}

function openSearchResultInNewTab(item: HTMLElement): void {
	window.open(getSearchResultUrl(item), '_blank');
}

function handleAlteredClick(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	openSearchResultInNewTab(event.delegateTarget);
}

const searchResultSelector = 'li[data-type="url-result"][id^="query-builder-test-result"]';

function initSearchResultsInNewTabOnce(): void {
	onAlteredClick(searchResultSelector, handleAlteredClick, {capture: true});
}

void features.add(import.meta.url, {
	init: onetime(initSearchResultsInNewTabOnce),
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com

*/
