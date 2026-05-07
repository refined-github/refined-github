import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import getSearchResultUrl from '../helpers/get-search-result-url.js';
import onetime from '../helpers/onetime.js';
import onAlteredClick from '../helpers/on-altered-click.js';

const searchResultSelector = 'li[id^="query-builder-test-result"]';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function handleAlteredClick(event: DelegateEvent<MouseEvent, HTMLLIElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank', 'noopener,noreferrer');
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

function initNewIssueInNewTabOnce(): void {
	onAlteredClick(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		handleAlteredClick,
		{capture: true},
	);
}

function initSearchResultsInNewTabOnce(): void {
	onAlteredClick(searchResultSelector, handleSearchResultAlteredClick, {capture: true});
	delegate(searchResultSelector, 'keydown', handleSearchResultKeyDown, {capture: true});
}

function initRepoPageHandlersOnce(): void {
	initNewIssueInNewTabOnce();
	initSearchResultsInNewTabOnce();
}

function init(signal: AbortSignal): void {
	delegate(
		[
			'a[href$="/issues/new/choose"]', // New issue button
			'a[class*="SubIssueTitle"]', // Sub-issue links
			'a[data-testid="issue-pr-title-link"]', // Global issue list links
		],
		'click',
		fix,
		{signal, capture: true},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList,
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
}, {
	include: [
		pageDetect.isRepo,
	],
	// No need to continuously register and unregister the handler
	init: onetime(initRepoPageHandlersOnce),
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
