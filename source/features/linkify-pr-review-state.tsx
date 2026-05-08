import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

const reviewStateFilters = new Map([
	[/^Draft$/, 'draft:true'],
	[/^Changes requested$/, 'review:changes-requested'],
	[/review approval/, 'review:approved'], // "1 review approval", "2 review approvals"
	[/^Awaiting review by you$/, 'review-requested:@me'],
]);

function linkify(link: HTMLAnchorElement): void {
	const text = link.textContent?.trim() ?? '';
	for (const [pattern, query] of reviewStateFilters) {
		if (pattern.test(text)) {
			link.href = SearchQuery.from(location).append(query).href;
			return;
		}
	}
}

function init(signal: AbortSignal): void {
	observe(
		'.js-issue-row .d-none.d-md-inline-flex a.Link--muted[href*="#"]',
		linkify,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRList,
	],
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/pulls (draft PRs visible)
- https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+review%3Aapproved (approved PRs)
- https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+review%3Achanges-requested (changes requested)
- https://github.com/pulls (global PR list with review-related states)

*/
