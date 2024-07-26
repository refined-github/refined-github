import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function updateTitle(input: HTMLSpanElement): void {
	document.title = input.textContent.trim() + ` - ${document.title}`;
}

function initForGlobalSearchResults(signal: AbortSignal): void {
	observe('span#qb-input-query',updateTitle,{signal})
}

void features.add(import.meta.url, {
	awaitDomReady: true,
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init: initForGlobalSearchResults
});

