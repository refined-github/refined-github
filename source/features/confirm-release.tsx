import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function handleSubmit(event: DelegateEvent<SubmitEvent, HTMLFormElement>): void {
	if (event.submitter?.matches('[publish-release="true"]') && !confirm('Are you sure you want to publish this release?')) {
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	delegate('form', 'submit', handleSubmit, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewRelease,
	],
	init,
});

/*

Test URLs:

isNewRelease: https://github.com/refined-github/sandbox/releases/new

*/
