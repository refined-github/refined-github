import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

async function cleanBar(): Promise<void> {
	(await elementReady<HTMLInputElement>('.header-search-input'))!.value = '';
}

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

void features.add({
	id: __filebasename,
	description: 'Changes the default sort order of conversations to `Recently updated`.',
	screenshot: false
}, {
	init
}, {
	include: [
		pageDetect.isGlobalConversationList
	],
	awaitDomReady: false,
	init: onetime(cleanBar)
});
