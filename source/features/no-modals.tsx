import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {isAlteredClick} from 'filter-altered-clicks';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function handleAlteredClick(event: DelegateEvent<MouseEvent, HTMLLIElement>): void {
	if (isAlteredClick(event)) {
		event.stopImmediatePropagation();
		event.preventDefault();
		window.open(buildRepoUrl('issues/new/choose'), '_blank');
	}
}

function initNewIssueInNewTab(signal: AbortSignal): void {
	delegate(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		'click',
		handleAlteredClick,
		{signal, capture: true},
	);
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
	init: initNewIssueInNewTab
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
