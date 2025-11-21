import {$optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function jumpToFirstNonViewed(): void {
	const firstNonViewedFile = $optional([
		'[id][data-details-container-group="file"]:not([data-file-user-viewed])', // TODO: Old PR Files view, drop in 2026
		'[id][class^="Diff-module"]:has(button[aria-pressed="false"])',
	]);
	if (firstNonViewedFile) {
		// Scroll to file without pushing to history
		location.replace('#' + firstNonViewedFile.id);
	} else {
		// The file hasn't loaded yet, so make GitHub load it by scrolling to the bottom
		window.scrollTo(window.scrollX, document.body.scrollHeight);
	}
}

const selectors = [
	'.diffbar-item progress-bar', // TODO: Old PR Files view, drop in 2026
	'.d-flex:has([class*="ViewedFileProgress"])',
];
async function init(signal: AbortSignal): Promise<void> {
	const bar = await elementReady(selectors);
	bar!.style.cursor = 'pointer';
	delegate(selectors, 'click', jumpToFirstNonViewed, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit,
	],
	init,
});

/*

Test URLs:

PR: https://github.com/refined-github/sandbox/pull/55/files
Large PR https://github.com/pixiebrix/pixiebrix-extension/pull/6808/files

*/
