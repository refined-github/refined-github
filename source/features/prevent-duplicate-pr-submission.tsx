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

void features.add(__filebasename, {
	include: [
		pageDetect.isCompare
	],
	init
});
