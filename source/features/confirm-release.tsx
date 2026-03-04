import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	if (!confirm('Are you sure you want to publish this release?')) {
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	delegate('button[publish-release="true"]', 'click', handleClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewRelease,
		pageDetect.isEditingRelease,
	],
	init,
});

/*

Test URLs:

isNewRelease: https://github.com/refined-github/sandbox/releases/new
isEditingRelease: https://github.com/refined-github/sandbox/releases/edit/cool

*/
