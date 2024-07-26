import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';


function initForGlobalSearchResults(): void {
	const query = new URLSearchParams(location.search).get('q')
	if (query) {
		// This is done on load because the title is updated by GitHub after the page is loaded
		window.addEventListener('load', () => {
			document.title = query.trim() + ` - ${document.title}`;
		})
	}
}

void features.add(import.meta.url, {
	awaitDomReady: true,
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init: initForGlobalSearchResults
});

