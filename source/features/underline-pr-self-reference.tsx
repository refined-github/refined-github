import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function underlinePrSelfReference(prLink: HTMLElement): void {
	prLink.style.textDecoration = 'underline wavy red';
	prLink.title = 'Link is a self-reference';
}

function init(signal: AbortSignal): void {
	observe(`.issue-link[href="${location.href.split('#')[0]}"]`, underlinePrSelfReference, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/pull/120

*/
