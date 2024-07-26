import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';

function init(): void {
	document.title = $('input#query-builder-test, input#js-issues-search')!.value.trim() + ` - ${document.title}`;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalSearchResults,
		pageDetect.isRepoSearch
	],
	init,
	awaitDomReady: true
});

