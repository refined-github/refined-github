import delegate, {type DelegateEvent} from 'delegate-it';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import onetime from '../helpers/onetime.js';
import onAlteredClick from '../helpers/on-altered-click.js';

const searchResultSelector = 'li[id^="query-builder-test-result"]';

function getSearchResultUrl(item: ParentNode): string | undefined {
	const actionListItem = $optional('.ActionListItem[data-href]', item);
	if (!actionListItem) {
		return;
	}

	const {href} = actionListItem.dataset;
	if (!href) {
		return;
	}

	const url = new URL(href, location.origin);
	if (url.origin !== location.origin) {
		return;
	}

	return url.href;
}

function openSearchResultInNewTab(item: ParentNode): boolean {
	const url = getSearchResultUrl(item);
	if (!url) {
		return false;
	}

	window.open(url, '_blank', 'noopener,noreferrer');
	return true;
}

function handleSearchResultAlteredClick(event: DelegateEvent<PointerEvent, HTMLLIElement>): void {
	if (!openSearchResultInNewTab(event.delegateTarget)) {
		return;
	}

	event.stopImmediatePropagation();
	event.preventDefault();
}

function handleSearchResultKeyDown(event: DelegateEvent<KeyboardEvent, HTMLLIElement>): void {
	if (event.isComposing || event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) {
		return;
	}

	if (!openSearchResultInNewTab(event.delegateTarget)) {
		return;
	}

	event.stopImmediatePropagation();
	event.preventDefault();
}

function initSearchResultsInNewTabOnce(): void {
	onAlteredClick(searchResultSelector, handleSearchResultAlteredClick, {capture: true});
	delegate(searchResultSelector, 'keydown', handleSearchResultKeyDown, {capture: true});
}

void features.add(import.meta.url, {
	// No need to continuously register and unregister the handler
	init: onetime(initSearchResultsInNewTabOnce),
});

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
