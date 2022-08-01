import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

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

function init(signal: AbortSignal): void {
	select('.diffbar-item progress-bar')!.style.cursor = 'pointer';
	delegate(document, '.diffbar-item progress-bar', 'click', jumpToFirstNonViewed, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		pageDetect.isPRFile404,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
