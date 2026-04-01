import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

const armedButtons = new WeakSet<HTMLButtonElement>();

function slowHideComment(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const button = event.delegateTarget;
	if (armedButtons.has(button)) {
		armedButtons.delete(button);
		return;
	}

	if (!confirm('Are you sure you want to confirm that you want to hide this comment?')) {
		event.preventDefault();
		event.stopImmediatePropagation();
		return;
	}

	if (!confirm('Are you sure you want to hide this comment?')) {
		event.preventDefault();
		event.stopImmediatePropagation();
		return;
	}

	if (!confirm('Just making sure you are really sure')) {
		event.preventDefault();
		event.stopImmediatePropagation();
		return;
	}


	armedButtons.add(button);
	event.preventDefault();
	event.stopImmediatePropagation();
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
