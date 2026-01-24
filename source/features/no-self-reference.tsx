import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function underlineSelfReference(link: HTMLElement): void {
	link.title = 'Link is a self-reference';

	// Disable hovercard
	delete link.dataset.hovercardUrl
	
	// Disable link altogether
	delete link.dataset.hovercardUrl
	
	// TODO: Use shorthand property in 2027 (due to Safari 18)
	link.style.textDecorationStyle = 'underline';
	link.style.textDecorationLine = 'wavy';
	link.style.textDecorationColor = 'red';
}

function init(signal: AbortSignal): void {
	observe(`.issue-link[href="${location.href.split('#')[0]}"]`, underlineSelfReference, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/pull/120
https://github.com/refined-github/sandbox/issues/122

*/
