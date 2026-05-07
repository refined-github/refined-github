import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import onAlteredClick from '../helpers/on-altered-click.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';

function openSearchResultInNewTab(item: HTMLElement): void {
	const {href} = item.dataset;
	if (!href) {
		throw new Error('Expected the search result item to have the `data-href` attribute');
	}

	window.open(href, '_blank');
}

function handleSearchResultAlteredClick(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	openSearchResultInNewTab(event.delegateTarget);
}

function initSearchResultsOnce(): void {
	onAlteredClick(
		'li.ActionListItem[data-type="url-result"]',
		handleSearchResultAlteredClick,
		{capture: true},
	);
}

function handleNewIssueAlteredClick(event: DelegateEvent<MouseEvent, HTMLLIElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank');
}

function initNewIssueOnce(): void {
	onAlteredClick(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		handleNewIssueAlteredClick,
		{capture: true},
	);
}

void features.add(import.meta.url, {
	init: onetime(initSearchResultsOnce),
}, {
	include: [
		pageDetect.isRepo,
	],
	// No need to continuously register and unregister the handler
	init: onetime(initNewIssueOnce),
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com

*/
