import select from 'select-dom';
import elementReady from 'element-ready';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

function jumpToFirstNonViewed(): void {
	const firstNonViewedFile = select('.file:not([data-file-user-viewed])')!;
	if (firstNonViewedFile) {
		// Scroll to file without pushing to history
		location.replace('#' + firstNonViewedFile.id);
	} else {
		// The file hasn't loaded yet, so make GitHub load it by scrolling to the bottom
		window.scrollTo(window.scrollX, document.body.scrollHeight);
	}
}

const selector = '.diffbar-item progress-bar';
async function init(signal: AbortSignal): Promise<void> {
	const bar = await elementReady(selector);
	bar!.style.cursor = 'pointer';
	delegate(selector, 'click', jumpToFirstNonViewed, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	init,
});
