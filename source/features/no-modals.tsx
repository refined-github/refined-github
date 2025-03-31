import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function fixNewIssueButton(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function init(signal: AbortSignal): void {
	delegate('a[href^="/issues/new/choose"]', 'click', fixNewIssueButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues
https://github.com/refined-github/refined-github/issues/8342

*/
