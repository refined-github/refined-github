import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {$} from 'select-dom';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

const reviewStateFilters = new Map([
	['Changes requested', 'review:changes-requested'],
	['Approved', 'review:approved'],
	['Review required', 'review:required'],

	// Missing from new view
	['Draft', 'draft:true'],
	// Not shown currently
	// [/^Awaiting review by you$/, 'review-requested:@me'],
]);

function alterLink(label: HTMLElement): void {
	for (const [text, filter] of reviewStateFilters) {
		// Use .textContent because "Draft" lacks any unique attributes
		if (label.textContent.trim() === text) {
			const url = new SearchQuery(buildRepoUrl('pulls')).append(filter).href;
			if (label instanceof HTMLAnchorElement) {
				label.href = url;
			} else {
				wrap(label, <a href={url} />);
				$('[class*="statusText"]', label).classList.add('Link--onHover');
			}
		}
	}
}

function init(signal: AbortSignal): void {
	observe(
		[
			'span[class^="ReviewDecision-module__reviewDecisionContent"]',

			// Note: This feature alters the `href` so this selector cannot be used by any other features
			// TODO: Drop selector when the old PR list is removed
			'.js-issue-row .text-small a[href$="#partial-pull-merging"]',
		],
		alterLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pulls?q=is%3Apr+%22linkify-pr-review-state%22

*/
