import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const regex = /\/files\/[\da-f]{40}..[\da-f]{40}$/;

function trimLink(link: HTMLAnchorElement): void {
	if (regex.test(link.pathname)) {
		link.pathname = link.pathname.replace(regex, '');
		link.hash = '#issue-comment-box';
	}
}

function init(signal: AbortSignal): void {
	// It's ok if it's not 100% safe because trimLink's regex is super specific
	observe('[href*="/pull/"][href*="/files/"][href*=".."]', trimLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URL:

https://github.com/notifications

*/
