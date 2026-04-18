import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function underlineSelfReference(link: HTMLAnchorElement): void {
	if (link.href !== location.href) {
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
	// TODO: Revert #9086 once #6554 is resolved
	// Exclude reference to a comment on the same page
	observe(
		'.markdown-body:not(section[aria-label="Events"] *) a.issue-link:not([href*="#"])',
		underlineSelfReference,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [pageDetect.isPR, pageDetect.isIssue],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/pull/120
https://github.com/refined-github/sandbox/issues/122

*/
