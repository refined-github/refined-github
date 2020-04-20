import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
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
			new SearchQuery(link).add('is:closed sort:updated-desc');
		}
	}
}

async function cleanBar(): Promise<void> {
	(await elementReady<HTMLInputElement>('.header-search-input'))!.value = '';
}

features.add({
	id: __featureName__,
	description: 'Shows both open and closed issues and PRs and sorts them by `Recently updated`.',
	screenshot: false
}, {
	init
}, {
	include: [
		features.isGlobalDiscussionList
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init: cleanBar
});
