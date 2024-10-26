import {expectElement as $} from 'select-dom';
import {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {onConversationTitleFieldKeydown} from '../github-events/on-field-keydown.js';

function handleEscPress(event: DelegateEvent<KeyboardEvent>): void {
	if (event.key === 'Escape') {
		$('.js-cancel-issue-edit').click();

		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function init(signal: AbortSignal): void {
	onConversationTitleFieldKeydown(handleEscPress, signal);
}

// TODO: Drop in March 2024, implemented by GitHub
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
