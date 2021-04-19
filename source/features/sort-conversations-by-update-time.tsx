import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	// Get issues links that don't already have a specific sorting applied
	const issueLinks = select.all('a:is([href*="/issues"], [href*="/pulls"]):not([href*="sort%3A"]):not(.issues-reset-query)');
	for (const link of issueLinks) {
		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (pageDetect.isConversationList(link) && !link.closest('.pagination, .table-list-filters')) {
			new SearchQuery(link).add('sort:updated-desc');
		}
	}

	// Extra nicety: Avoid GitHub's unnecessary redirect, this is their own bug
	for (const link of select.all('a[href*="/issues"][href*="is%3Apr"]:not([href*="is%3Aprivate"])')) {
		link.pathname = link.pathname.replace(/issues\/?$/, 'pulls');
	}
}

void features.add(__filebasename, {
	init
});
