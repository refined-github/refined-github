import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $$optional, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import {onCommentFieldKeydown, onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';

function handleEscPress(event: DelegateEvent<KeyboardEvent, HTMLInputElement | HTMLTextAreaElement>): void {
	if (event.key !== 'Escape') {
		return;
	}

	const field = event.delegateTarget;
	if (field instanceof HTMLInputElement) {
		const cancelButton = $([
			'div[class^="prc-PageLayout-HeaderContent"] > form button[data-variant="invisible"]',
			// TODO [2027-01-01]: Remove after legacy PR files view is removed
			'.js-cancel-issue-edit',
		]);
		if (cancelButton.textContent.trim() !== 'Cancel') {
			throw new Error('Expected to find a cancel button');
		}

		cancelButton.click();
	} else {
		const editor = closestElementOptional('form, fieldset', field);
		const cancelButton = $$optional('button:not([disabled])', editor ?? undefined)
			.find(button => button.textContent.trim() === 'Cancel');

		// Some comment fields are always visible and don't have a cancel button
		if (cancelButton) {
			cancelButton.click();
		} else {
			field.blur();
		}
	}

	event.stopImmediatePropagation();
	event.preventDefault();
}

function initTitle(signal: AbortSignal): void {
	onConversationTitleFieldKeydown(handleEscPress, signal);
}

function initComments(signal: AbortSignal): void {
	onCommentFieldKeydown(handleEscPress, signal);
}

void features.add(import.meta.url, {
	shortcuts: {
		esc: 'Cancel editing a conversation title or review comment',
	},
	include: [
		pageDetect.isPR,
	],
	init: initTitle,
}, {
	include: [
		pageDetect.isPRFiles,
	],
	init: initComments,
});

/*

Test URLs:

1. Visit https://github.com/pulls
2. Open any PR
3. Try to edit the title
4. Press Esc

Review comments:

1. Visit https://github.com/refined-github/sandbox/pull/4/files
2. Start an inline review comment
3. Press Esc

*/
