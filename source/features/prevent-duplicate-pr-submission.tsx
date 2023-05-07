import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

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
