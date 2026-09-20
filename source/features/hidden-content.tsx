/**
@description Informs you that there are hidden comments or files when pressing <kbd>Cmd</kbd><kbd>F</kbd> or <kbd>Ctrl</kbd><kbd>F</kbd>.
@screenshot https://github.com/user-attachments/assets/5437d8fc-c539-4d13-98b3-d7049d2d92e7
*/

import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {isMac, scrollIntoViewIfNeeded} from '../github-helpers/index.js';
import showOverlay from '../helpers/overlay.js';

function isCtrlF(event: KeyboardEvent): boolean {
	return (
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
		// TODO: Add support for PRs by detecting deferred-content wrappers
	);
	if (!indicator) {
		return;
	}

	const content = pageDetect.isPRFiles() ? 'files' : 'comments';
	scrollIntoViewIfNeeded(indicator);
	await showOverlay(`There are hidden ${content} that won't be searched`);
}

function init(signal: AbortSignal): void {
	globalThis.addEventListener('keydown', scrollOnSearch, {signal});
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
