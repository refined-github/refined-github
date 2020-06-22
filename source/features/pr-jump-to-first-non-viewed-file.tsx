import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function jumpToFirstNonViewed(): void {
	const firstNonViewedFile = select('.js-reviewed-checkbox:not([checked])')!;
	if (!firstNonViewedFile) {
		// The file hasn't loaded yet, so we should scroll to the end of the page to make GitHub load it
		window.scrollTo(window.scrollX, document.body.scrollHeight);
		return;
	}

	const fileID = 	firstNonViewedFile.closest('[id]')!.id;
	// Scroll to file without pushing to history
	location.replace('#' + fileID);
}

function init(): void {
	delegate(document, '.diffbar-item progress-bar', 'click', jumpToFirstNonViewed);
	select('.diffbar-item progress-bar')!.style.cursor = 'pointer';
}

void features.add({
	id: __filebasename,
	description: 'Jumps to first non-viewed file in a pull request when clicking on the progress bar.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/85226580-3bf3d500-b3a6-11ea-8494-3d9b6280d033.gif'
}, {
	include: [
		pageDetect.isPRFiles
	],
	init
});
