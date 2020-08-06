import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let previousSubmission = 0;

function preventSubmit(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	if (Date.now() - previousSubmission < 1000) {
		event.preventDefault();
	}

	previousSubmission = Date.now();
}

function init(): void {
	delegate(document, '#new_pull_request', 'submit', preventSubmit);
}

void features.add({
	id: __filebasename,
	description: 'Prevents a pull request from mistakenly submitted twice when create pull request is double clicked.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89417135-47a01e80-d6fc-11ea-98fb-724db6647592.gif'
}, {
	include: [
		pageDetect.isCompare
	],
	init
});
