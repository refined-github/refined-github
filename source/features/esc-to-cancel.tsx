import {$} from 'select-dom';
import {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';

function handleEscPress(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		$('.js-cancel-issue-edit')!.click();

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
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	init,
});
