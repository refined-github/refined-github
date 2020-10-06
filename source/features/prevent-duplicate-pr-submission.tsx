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
	description: 'Avoids creating duplicate PRs when mistakenly clicking "Create pull request" more than once.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89589967-e029c200-d814-11ea-962b-3ff1f6236781.gif'
}, {
	include: [
		pageDetect.isCompare
	],
	init
});
