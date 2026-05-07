import type {DelegateEvent} from 'delegate-it';

import onAlteredClick from '../helpers/on-altered-click.js';
import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';

function openSearchResultInNewTab(item: HTMLElement): void {
	const {href} = item.dataset;
	if (!href) {
		throw new Error('Expected the search result item to have the `data-href` attribute');
	}

	window.open(href, '_blank');
}

function handleAlteredClick(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	openSearchResultInNewTab(event.delegateTarget);
}

function initSearchResultsInNewTabOnce(): void {
	onAlteredClick('li.ActionListItem[data-type="url-result"]', handleAlteredClick, {capture: true});
}

void features.add(import.meta.url, {
	init: onetime(initSearchResultsInNewTabOnce),
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com

*/
