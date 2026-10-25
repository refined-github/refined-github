import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';

function fix(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

// The nested list has no stable class, but it's in the same container as its header
function isSubIssueLink(link: HTMLElement): boolean {
	for (let parent = link.parentElement; parent; parent = parent.parentElement) {
		if (elementExists(':scope > [id$="-nested-list-view-metadata"]', parent)) {
			return true;
		}
	}

	return false;
}

function fixSubIssueLink(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	if (isSubIssueLink(event.delegateTarget)) {
		fix(event);
	}
}

function init(signal: AbortSignal): void {
	delegate(
		[
			'a[href$="/issues/new/choose"]', // New issue button
			'a[class*="SubIssueTitle"]', // Sub-issue links
			'li[class*="listItem"] [class*="heading"] > a[class*="anchor"]:is([href*="/issues/"], [href*="/pull/"])', // Issue list links
		],
		'click',
		fix,
		{signal, capture: true},
	);

	delegate('a:is([href*="/issues/"], [href*="/pull/"])', 'click', fixSubIssueLink, {signal, capture: true});
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
