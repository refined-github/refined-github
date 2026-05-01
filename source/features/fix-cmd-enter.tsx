import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom';

import features from '../feature-manager.js';

function handleKeyDown(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) {
		return;
	}

	const reopenButton = $optional('button[name="comment_and_open"]:disabled');
	if (!reopenButton) {
		return;
	}

	const {form} = reopenButton;
	if (!form) {
		return;
	}

	$('.btn-primary[type="submit"]', form)?.click();
	event.preventDefault();
}

function init(signal: AbortSignal): void {
	delegate('#new_comment_field', 'keydown', handleKeyDown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/22

*/
