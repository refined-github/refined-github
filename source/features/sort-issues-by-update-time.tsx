import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import SearchQuery from '../libs/search-query';

function init(): void {
	// Get issues links that don't already have a specific sorting applied
	for (const link of select.all<HTMLAnchorElement>(`
		[href*="/issues"]:not([href*="sort%3A"]):not(.issues-reset-query),
		[href*="/pulls" ]:not([href*="sort%3A"]):not(.issues-reset-query)
	`)) {
		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (/(issues|pulls)\/?$/.test(link.pathname) && !link.closest('.pagination, .table-list-filters')) {
			new SearchQuery(link).add('sort:updated-desc');
		}
	}

	// Extra nicety: Avoid GitHub's unnecessary redirect, this is their own bug
	for (const link of select.all<HTMLAnchorElement>('[href*="/issues"][href*="is%3Apr"]')) {
		link.pathname = link.pathname.replace(/issues\/?$/, 'pulls');
	}
}

async function cleanBar(): Promise<void> {
	(await elementReady<HTMLInputElement>('.header-search-input'))!.value = '';
}

features.add({
	id: __filebasename,
	description: 'Changes the default sort order of discussions to `Recently updated`.',
	screenshot: false
}, {
	init
}, {
	include: [
		pageDetect.isGlobalDiscussionList
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init: cleanBar
});
