import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $$, $closest} from 'select-dom';

import features from '../feature-manager.js';
import {commentBoxHashIssue, commentBoxHashPr, commentsCountInLists} from '../github-helpers/selectors.js';
import {wrap} from '../helpers/dom-utils.js';

function getHash(type: 'issue' | 'pr'): string {
	return type === 'issue' ? commentBoxHashIssue : commentBoxHashPr;
}

function init(): void {
	for (const item of $$(commentsCountInLists)) {
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
			wrap(item, <a href={url.href}/>);
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/labels/bug

*/
