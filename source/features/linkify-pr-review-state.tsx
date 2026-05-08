import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';
import {buildRepoUrl} from '../github-helpers/index.js';

const reviewStateFilters = new Map([
	['Draft', 'draft:true'],
	['Changes requested', 'review:changes-requested'],
	['Approved', 'review:approved'],
	['Review required', 'review:required'],

	// Not shown currently
	// [/^Awaiting review by you$/, 'review-requested:@me'],
]);

function alterLink(link: HTMLAnchorElement): void {
	for (const [text, filter] of reviewStateFilters) {
		// Use .textContent because "Draft" lacks any unique attributes
		if (link.textContent.trim() === text) {
			link.href = new SearchQuery(buildRepoUrl('pulls')).append(filter).href;
			return;
		}
	}
}

function init(signal: AbortSignal): void {
	// Note: This feature alters the `href` so this selector cannot be used by any other features
	observe('.js-issue-row .text-small a[href$="#partial-pull-merging"]', alterLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pulls?q=is%3Apr+%22linkify-pr-review-state%22

*/
