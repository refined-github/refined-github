import select from 'select-dom';
import {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown';

function handleEscPress(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		select('.js-cancel-issue-edit')!.click();

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
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
