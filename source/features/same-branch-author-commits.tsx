import {$$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const authorLinkSelector = 'a[aria-label^="commits by"]';

function init(): void {
	for (const author of $$optional(authorLinkSelector)) {
		author.pathname = location.pathname;
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	awaitDomReady: true, // Small page
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/commits/branch/with/slashes/
https://github.com/refined-github/sandbox/commits/new/.github

*/
