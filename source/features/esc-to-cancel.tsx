import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';

function handleEscPress(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		if (!(event.delegateTarget instanceof HTMLInputElement)) {
			return;
		}

		const cancelButton = $([
			'div[class^="prc-PageLayout-HeaderContent"] > form button[data-variant="invisible"]',
			// Old view -- TODO: Remove after legacy PR files view is removed
			'.js-cancel-issue-edit',
		]);
		if (cancelButton.textContent.trim() !== 'Cancel') {
			throw new Error('Expected to find a cancel button');
		}

		cancelButton.click();
		event.stopImmediatePropagation();
		event.preventDefault();
	}
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
