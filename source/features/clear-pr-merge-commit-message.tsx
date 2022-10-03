import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

function init(): void | false {
	const messageField = select('textarea#merge_message_field')!;
	const originalMessage = messageField.value;
	const deduplicatedAuthors = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of originalMessage.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		deduplicatedAuthors.add('Co-authored-by: ' + author);
	}

	const cleanedMessage = [...deduplicatedAuthors].join('\n');
	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	messageField.value = cleanedMessage;
	messageField.after(
		<p className="note rgh-sync-pr-commit-title-note">
			The description field was cleared by <a target="_blank" href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message" rel="noreferrer">Refined GitHub</a>.
		</p>,
		<hr/>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => select.all('.TimelineItem.js-commit').length === 1,
	],
	additionalListeners: [
		onPrMergePanelOpen,
	],
	onlyAdditionalListeners: true,
	awaitDomReady: false,
	init,
});
