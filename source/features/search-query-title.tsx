import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';

function updateTitle(e?: Event): void {
	const query = SearchQuery.from(location).get()
	if (!query) return

	const title = query.trim() + ` - ${document.title}`;

	if (e) {
		document.title = title;
	} else {
		// This is done on load because the title is updated by GitHub during the page load
		window.addEventListener('load', () => {
			document.title = title;
		})
	}
}

function init(): void {
	updateTitle()
	document.addEventListener('soft-nav:end', updateTitle)
}

void features.add(import.meta.url, {
	awaitDomReady: true,
	include: [
		pageDetect.isGlobalSearchResults,
		pageDetect.isIssueOrPRList
	],
	init
});
