import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function trimLink(link: HTMLAnchorElement): void {
	console.log(link.pathname);

	link.pathname = link.pathname.replace(/\/files\/[\da-f]{40}..[\da-f]{40}$/, '');
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
