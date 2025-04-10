import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	delegate([
		'a[href$="/issues/new/choose"]', // New issue button
		'a[class*="SubIssueTitle"]', // Sub-issue links
		'a[class^="TitleHeader-module__inline"]', // Global Issue title
	], 'click', fix, {signal, capture: true});
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
