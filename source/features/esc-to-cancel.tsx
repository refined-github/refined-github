import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';
import {assertNodeContent} from '../helpers/dom-utils.js';

function handleEscPress(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key !== 'Escape') {
		return;
	}

	if (!(event.delegateTarget instanceof HTMLInputElement)) {
		return;
	}

	const cancelButton = $([
		'div[class^="prc-PageLayout-HeaderContent"] > form button[data-variant="invisible"]',
		// TODO [2027-01-01]: Remove after legacy PR files view is removed
		'.js-cancel-issue-edit',
	]);
	assertNodeContent(cancelButton, 'Cancel');

	cancelButton.click();
	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(signal: AbortSignal): void {
	onConversationTitleFieldKeydown(handleEscPress, signal);
}

void features.add(import.meta.url, {
	shortcuts: {
		esc: 'Cancel editing a conversation title',
	},
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/pulls
2. Open any PR
3. Try to edit the title
4. Press Esc

*/
