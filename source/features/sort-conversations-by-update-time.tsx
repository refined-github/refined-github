import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import SearchQuery from '../github-helpers/search-query';

/** Keep the original URL on the element so that `shorten-links` can use it reliably #5890 */
export function saveOriginalHref(link: HTMLAnchorElement): void {
	if (!link.dataset.originalHref) {
		link.dataset.originalHref = link.href;
	}
}

function selectCurrentConversationFilter(): void {
	const currentSearchURL = location.href.replace('/pulls?', '/issues?'); // Replacement needed to make up for the redirection of "Your pull requests" link
	const currentFilter = select(`#filters-select-menu a.SelectMenu-item[href="${currentSearchURL}"]`);
	if (currentFilter) {
		select('#filters-select-menu [aria-checked="true"]')?.setAttribute('aria-checked', 'false');
		currentFilter.setAttribute('aria-checked', 'true');
	}
}

function init(): void {
	// Get issues links that don't already have a specific sorting applied
	const issueLinks = select.all('a:is([href*="/issues"], [href*="/pulls"], [href*="/projects"], [href*="/labels/"]):not([href*="sort%3A"], .issues-reset-query)');
	for (const link of issueLinks) {
		if (link.host !== location.host || link.closest('.pagination, .table-list-header-toggle')) {
			continue;
		}

		// Pick only links to lists, not single issues
		// + skip pagination links
		// + skip pr/issue filter dropdowns (some are lazyloaded)
		if (pageDetect.isIssueOrPRList(link)) {
			saveOriginalHref(link);

			const newUrl = SearchQuery.from(link).add('sort:updated-desc').href;

			// Preserve relative attributes as such #5435
			const isRelativeAttribute = link.getAttribute('href')!.startsWith('/');
			link.href = isRelativeAttribute ? newUrl.replace(location.origin, '') : newUrl;
		}

		// Also sort projects #4957
		if (pageDetect.isProjects()) {
			saveOriginalHref(link);

			// Projects use a different parameter name so don't use SearchQuery
			const search = new URLSearchParams(link.search);
			const query = search.get('query') ?? 'is:open'; // Default value query is missing
			search.set('query', `${query} sort:updated-desc`);
			link.search = String(search);
		}
	}
}

void features.add(import.meta.url, {
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	deduplicate: 'has-rgh-inner',
	init: selectCurrentConversationFilter,
});
