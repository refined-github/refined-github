/**
@description Preserves current branch and path when viewing all commits by an author.
@screenshot https://user-images.githubusercontent.com/44045911/148764372-ee443213-e61a-4227-9219-0ee54ed832e8.png
*/

import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';

const authorLinkSelector = 'a[aria-label^="commits by"]';

function init(): void {
	for (const author of $$(authorLinkSelector)) {
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
