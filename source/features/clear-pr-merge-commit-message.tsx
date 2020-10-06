import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

function init(): void {
	const messageField = select<HTMLTextAreaElement>('#merge_message_field')!;

	const deduplicatedAuthors = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of messageField.value.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		deduplicatedAuthors.add('Co-authored-by: ' + author);
	}

	messageField.value = [...deduplicatedAuthors].join('\n');
}

void features.add({
	id: __filebasename,
	description: 'Clears the PR merge commit message of clutter, leaving only deduplicated co-authors.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/79257078-62b6fc00-7e89-11ea-8798-c06f33baa94b.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => select.all('.TimelineItem.js-commit').length === 1
	],
	additionalListeners: [
		onPrMergePanelOpen
	],
	onlyAdditionalListeners: true,
	awaitDomReady: false,
	init
});
