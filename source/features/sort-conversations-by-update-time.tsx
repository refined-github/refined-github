import select from 'select-dom';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	// Get issues links that don't already have a specific sorting applied
	for (const link of select.all(`
		a[href*="/issues"]:not([href*="sort%3A"]):not(.issues-reset-query),
		a[href*="/pulls" ]:not([href*="sort%3A"]):not(.issues-reset-query)
	`)) {
		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (/(issues|pulls)\/?$/.test(link.pathname) && !link.closest('.pagination, .table-list-filters')) {
			new SearchQuery(link).add('sort:updated-desc');
		}
	}

	// Extra nicety: Avoid GitHub's unnecessary redirect, this is their own bug
	for (const link of select.all('a[href*="/issues"][href*="is%3Apr"]')) {
		link.pathname = link.pathname.replace(/issues\/?$/, 'pulls');
	}
}

void features.add(__filebasename, {
	init
});
