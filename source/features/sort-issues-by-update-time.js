import select from 'select-dom';
import {getUsername} from '../libs/utils';

function getDefaultQuery(link, search) {
	// Query-less URLs imply some queries.
	// When we explicitly set ?q=* they're overridden,
	// so they need to be manually added again.
	const queries = [];

	// Repo example: is:issue is:open
	queries.push(/\/pulls\/?$/.test(link.pathname) ? 'is:pr' : 'is:issue');
	queries.push('is:open');

	// Header nav example: is:open is:issue author:you archived:false
	if (link.pathname === '/issues' || link.pathname === '/pulls') {
		if (search.has('user')) { // #1211
			queries.push(`user:${search.get('user')}`);
		} else {
			queries.push(`author:${getUsername()}`);
		}
		queries.push('archived:false');
	}
	return queries.join(' ');
}

export default function () {
	// Get issues links that don't already have a specific sorting applied
	for (const link of select.all(`
		[href*="/issues"]:not([href*="sort%3A"]):not(.issues-reset-query),
		[href*="/pulls" ]:not([href*="sort%3A"]):not(.issues-reset-query)
	`)) {
		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (/(issues|pulls)\/?$/.test(link.pathname) && !link.closest('.pagination, .table-list-filters')) {
			const search = new URLSearchParams(link.search);
			const existingQuery = search.get('q') || getDefaultQuery(link, search);
			search.set('q', `${existingQuery} sort:updated-desc`);
			link.search = search;
		}
	}

	// Extra nicety: Avoid GitHub's unnecessary redirect, this is their own bug
	for (const link of select.all('[href*="/issues"][href*="is%3Apr"]')) {
		link.pathname = link.pathname.replace(/issues\/?$/, 'pulls');
	}
}
