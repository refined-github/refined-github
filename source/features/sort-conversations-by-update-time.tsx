import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function init(): void {
	// Get issues links that don't already have a specific sorting applied
	const issueLinks = select.all('a:is([href*="/issues"], [href*="/pulls"], [href*="/projects"]):not([href*="sort%3A"], .issues-reset-query)');
	for (const link of issueLinks) {
		if (link.host !== location.host || link.closest('.pagination, .table-list-header-toggle')) {
			return;
		}

		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (pageDetect.isConversationList(link)) {
			new SearchQuery(link).add('sort:updated-desc');
		}

		if (pageDetect.utils.getRepositoryInfo(link)?.path === 'projects') {
			// Projects use a different parameter name so don't use SearchQuery
			const search = new URLSearchParams(link.search);
			const query = search.get('query') ?? 'is:open'; // Default value query is missing
			search.set('query', `${query} sort:updated-desc`);
			link.search = search.toString();
		}
	}
}

void features.add(__filebasename, {
	init,
});
