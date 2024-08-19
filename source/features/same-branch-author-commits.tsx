import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const authorLinkSelector = 'a[aria-label^="commits by"]';

function changePath(authorLink: HTMLAnchorElement): void {
	authorLink.pathname = location.pathname;
}

function init(signal: AbortSignal): void {
	observe(authorLinkSelector, changePath, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/commits/branch/with/slashes/
https://github.com/refined-github/sandbox/commits/new/.github

*/
