import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function disableLink(link: HTMLAnchorElement): void {
	if (link.getAttribute('href') !== location.pathname) {
		throw new Error('The template chooser bug might have been fixed');
	}

	link.removeAttribute('href');
}

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

function disableDeadLinks(signal: AbortSignal): void {
	// Explanation: https://github.com/refined-github/refined-github/issues/9615
	observe('div[data-testid="repository-and-template-picker-dialog"] a', disableLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList,
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
}, {
	init: disableDeadLinks,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
