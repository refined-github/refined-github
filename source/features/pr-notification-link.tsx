import * as pageDetect from 'github-url-detection';

import {getCleanPathname} from '../github-helpers/index.js';
import {commentBoxHashPr} from '../github-helpers/selectors.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

export function removeLinkToPrFilesTab(link: HTMLAnchorElement): void {
	if (pageDetect.isPRFiles(link)) {
		// Owner + name + pull + number
		link.pathname = getCleanPathname(link).split('/').slice(0, 4).join('/');
		link.hash = commentBoxHashPr;
	}
}

function init(signal: AbortSignal): void {
	observe('[href*="/pull/"][href*=".."]', removeLinkToPrFilesTab, {signal});
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
