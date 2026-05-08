import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$, $closest} from 'select-dom';

import features from '../feature-manager.js';
import {commentBoxHashIssue, commentBoxHashPr, commentsCountInLists} from '../github-helpers/selectors.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function getHash(type: 'issue' | 'pr'): string {
	return type === 'issue' ? commentBoxHashIssue : commentBoxHashPr;
}

function linkify(item: HTMLElement): void {
	console.log(item);
	if (item instanceof HTMLAnchorElement) {
		// Only PR lists are already linked
		item.hash = getHash('pr');
	} else {
		// The box hash must be determine by conversation type because (React) issue lists might contain links to PRs too
		const conversationLink = $([
			'a[href*="/issues/"]',
			'a[href*="/pull/"]',
		], $closest('li', item));
		const url = new URL(conversationLink.href);
		const type = pageDetect.isIssue(url) ? 'issue' : 'pr';
		url.hash = getHash(type);
		wrap(item, <a href={url.href} className="Link--muted"/>);
	}
}

function init(signal: AbortSignal): void {
	observe(commentsCountInLists, linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- issues https://github.com/refined-github/sandbox/issues?q=is%3Aissue%20testing
- pulls https://github.com/refined-github/sandbox/pulls?q=is%3Apr+an+

Test 0, 1, 2+ comments

*/
