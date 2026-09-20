/**
@description Avoids creating duplicate PRs when mistakenly clicking "Create pull request" more than once.
@screenshot https://user-images.githubusercontent.com/16872793/89589967-e029c200-d814-11ea-962b-3ff1f6236781.gif
*/

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

let previousSubmission = 0;

function preventSubmit(event: DelegateEvent): void {
	if (Date.now() - previousSubmission < 1000) {
		event.preventDefault();
	}

	previousSubmission = Date.now();
}

function init(signal: AbortSignal): void {
	delegate('#new_pull_request', 'submit', preventSubmit, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/refined-github/sandbox/compare/default-a...7416?expand=1
2. Double-click "Create pull request"

*/
