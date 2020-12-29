import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

function init(): void {
	const messageField = $('textarea#merge_message_field')!;
	const deduplicatedAuthors = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of messageField.value.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		deduplicatedAuthors.add('Co-authored-by: ' + author);
	}

	messageField.value = [...deduplicatedAuthors].join('\n');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => $$('.TimelineItem.js-commit').length === 1
	],
	additionalListeners: [
		onPrMergePanelOpen
	],
	onlyAdditionalListeners: true,
	awaitDomReady: false,
	init
});
