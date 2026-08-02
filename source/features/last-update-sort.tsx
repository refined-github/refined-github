import * as pageDetect from 'github-url-detection';
import oneEvent from 'one-event';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import {linksToConversationLists} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';
import {newIssueModalDeadLinks} from './new-tab-links.js';

/** Keep the original URL on the element so that `shorten-links` can use it reliably #5890 */
export function saveOriginalHref(link: HTMLAnchorElement): void {
	link.dataset.originalHref ??= link.href;
}

async function updateLink(link: HTMLAnchorElement): Promise<void> {
	if (link.host !== location.host) {
		return;
	}

	// Avoid conflict with `new-tab-links` in New Issue modal
	// https://github.com/refined-github/refined-github/pull/9640/changes#r3328459390
	if (link.matches(newIssueModalDeadLinks)) {
		return;
	}

	// Pick only links to lists, not single issues
	// + skip pagination links
	// + skip pr/issue filter dropdowns (some are lazyloaded)
	if (pageDetect.isIssueOrPRList(link)) {
		// Avoid rewriting /labels/ URLs until the last moment
		// https://github.com/refined-github/refined-github/issues/7205
		if (pageDetect.isRepoTaxonomyIssueOrPRList(link)) {
			await oneEvent(link, 'click', {filter: event => (event as MouseEvent).which < 2});
		}

		saveOriginalHref(link);

		const newUrl = SearchQuery.from(link).prepend('sort:updated-desc').href;

		// Preserve relative attributes as such #5435
		const isRelativeAttribute = link.getAttribute('href')!.startsWith('/');
		link.href = isRelativeAttribute ? newUrl.replace(location.origin, '') : newUrl;
	}

	// Also sort projects #4957
	if (pageDetect.isProjects()) {
		saveOriginalHref(link);

		// Projects use a different parameter name so don't use SearchQuery
		const search = new URLSearchParams(link.search);
		const query = search.get('query') ?? 'state:open'; // Default value query is missing
		search.set('query', `sort:updated-desc ${query}`);
		link.search = search.toString();
	}
}

function shouldAddSort(url: URL): string | undefined {
	if (url.host !== location.host) {
		return;
	}

	const q = url.searchParams.get('q');
	if (
		!q
		|| q.includes('sort:updated-desc')
		|| q.includes('sort:updated-asc')
		|| url.searchParams.has('page')
	) {
		return;
	}

	// Check if this is a conversation list URL
	const isConversationList = url.pathname.includes('/issues')
		|| url.pathname.includes('/pulls')
		|| url.pathname.includes('/projects');
	if (!isConversationList) {
		return;
	}

	const searchQuery = new SearchQuery(url.href);
	searchQuery.prepend('sort:updated-desc');
	return searchQuery.href;
}

function init(signal: AbortSignal): void {
	// Get links that don't already have a specific sorting or pagination applied
	observe(
		linksToConversationLists,
		updateLink,
		{signal},
	);

	// Intercept navigation to handle sidebar links that are rendered by React
	// and not caught by the AnimationObserver. GitHub's own navigation ignores
	// the modified href for these links.
	// https://github.com/refined-github/refined-github/issues/9927
	navigation?.addEventListener('navigate', (event: NavigateEvent) => {
		// Skip history navigation (back/forward)
		if (event.navigationType === 'traverse') {
			return;
		}

		const sortedUrl = shouldAddSort(new URL(event.destination.url));
		if (sortedUrl) {
			event.preventDefault();
			location.href = sortedUrl;
		}
	}, {signal});
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs

Live links, these should be altered to include the `sort:updated-desc` query parameter:

- https://github.com/refined-github/refined-github/pulls
- https://github.com/refined-github/refined-github/labels/bug

*/