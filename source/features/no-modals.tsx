import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import onAlteredClick from '../helpers/on-altered-click.js';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function handleAlteredClick(event: DelegateEvent<MouseEvent, HTMLLIElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank');
}

function initNewIssueInNewTabOnce(): void {
	onAlteredClick(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		handleAlteredClick,
		{capture: true},
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
	// No need to continuously register and unregister the handler
	init: onetime(initNewIssueInNewTabOnce),
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
