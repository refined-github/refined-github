import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function slowHideComment(event: DelegateEvent<MouseEvent>): void {
	if (!confirm('Hide this comment the slow way?')) {
		event.preventDefault();
		event.stopImmediatePropagation();
	}
}

function init(signal: AbortSignal): void {
	// Let GitHub keep its original hide flow after the confirmation.
	delegate('.js-comment-hide-button', 'click', slowHideComment, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/47

*/
