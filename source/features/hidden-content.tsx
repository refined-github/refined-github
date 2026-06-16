import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {isMac, scrollIntoViewIfNeeded} from '../github-helpers/index.js';
import showOverlay from '../helpers/overlay.js';

function isCtrlF(event: KeyboardEvent): boolean {
	return (
		// eslint-disable-next-line unicorn/prefer-minimal-ternary -- No.
		(isMac ? event.metaKey : event.ctrlKey)
		&& !event.shiftKey
		&& !event.altKey
		&& event.key === 'f'
	);
}

// Don't use `data-hotkey` because it always prevents default
async function scrollOnSearch(event: KeyboardEvent): Promise<void> {
	if (!isCtrlF(event)) {
		return;
	}

	const indicator = $optional(
		// Issues
		'[class*="LoadMore"]',
	);
	if (indicator) {
		const content = pageDetect.isPRFiles() ? 'files' : 'comments';
		scrollIntoViewIfNeeded(indicator);
		await showOverlay(`There are hidden ${content} that won’t be searched`);
	}
}

function init(signal: AbortSignal): void {
	addEventListener('keydown', scrollOnSearch, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs

https://togithub.com/prettier/prettier/issues/7475

*/
