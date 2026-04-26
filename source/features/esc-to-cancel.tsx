import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $$optional} from 'select-dom';

import features from '../feature-manager.js';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';

function normalizeText(text: string): string {
	return text.replaceAll(/\s+/g, ' ').trim();
}

const titleContainerSelectors = [
	'[class^="prc-PageLayout-Header"]', // New PR header
	'.gh-header-title', // Old issue/PR header
];

function findCancelButton(field: HTMLInputElement): HTMLButtonElement | HTMLAnchorElement {
	const titleContainer = field.closest(titleContainerSelectors);
	return $$optional('button:not([disabled])', titleContainer ?? undefined)
		.find(button => normalizeText(button.textContent) === 'Cancel')
		?? $('.js-cancel-issue-edit');
}

function handleEscPress(event: DelegateEvent<KeyboardEvent, HTMLInputElement | HTMLTextAreaElement>): void {
	if (event.key === 'Escape') {
		if (!(event.delegateTarget instanceof HTMLInputElement)) {
			return;
		}

		findCancelButton(event.delegateTarget).click();
		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	onConversationTitleFieldKeydown(handleEscPress, signal);
}

// TODO: Drop in March 2025, implemented by GitHub
// https://github.com/refined-github/refined-github/pull/7892
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

/*

Test URLs:

1. Visit https://github.com/issues?q=+archived%3Afalse+author%3A%40me
2. Open any issue/PR
3. Try to edit the title
4. Press Esc

*/
