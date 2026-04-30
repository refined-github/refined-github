import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {isAlteredClick} from 'filter-altered-clicks';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';

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

function initNewIssueInNewTabOnce(): void {
	delegate(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		'click',
		handleAlteredClick,
		{capture: true},
	);
	delegate(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		'auxclick',
		handleAlteredClick,
		{capture: true},
	);
}

const noModalSelectors = [
	'a[href$="/issues/new/choose"]', // New issue button
	'a[class*="SubIssueTitle"]', // Sub-issue links
	'a[data-testid="issue-pr-title-link"]', // Global issue list links
];

function init(signal: AbortSignal): void {
	delegate(noModalSelectors, 'click', fix, {signal, capture: true});
	delegate(noModalSelectors, 'auxclick', fix, {signal, capture: true});
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
	init: onetime(initNewIssueInNewTabOnce),
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
