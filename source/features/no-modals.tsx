/**
@description Disable modals that reduce user-experience instead of enhancing it.
@screenshot https://github.com/user-attachments/assets/7b63c7db-ae31-4ee8-8510-3b9db0c11f3e
*/

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
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
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
