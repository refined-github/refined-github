import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function underlineSelfReference(link: HTMLAnchorElement): void {
	// Revert #9086 once #6554 is resolved
	const [currentPage] = location.href.split('#');
	const [linkTarget] = link.href.split('#');
	if (currentPage !== linkTarget) {
		return;
	}

	link.title = 'Link is a self-reference';

	// Disable link and hovercard
	link.removeAttribute('href');
	link.removeAttribute('data-hovercard-url');

	// TODO: Use shorthand `text-decoration` property in 2027 (due to Safari 18)
	link.style.textDecorationLine = 'underline';
	link.style.textDecorationStyle = 'wavy';
	link.style.textDecorationColor = 'red';
}

function init(signal: AbortSignal): void {
	observe('.markdown-body:is(:not(section[aria-label="Events"] *)) .issue-link', underlineSelfReference, {signal});
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
