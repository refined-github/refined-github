import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

async function init(): Promise<void | false> {
	const messageField = select('textarea#merge_message_field')!;
	const originalMessage = messageField.value;
	const deduplicatedAuthors = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of originalMessage.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		deduplicatedAuthors.add('Co-authored-by: ' + author);
	}

	// Preserve closing issues numbers when a pr is merged into a non-default branch since GitHub doesn't close them #4531
	const baseBranch = select('.base-ref a')!.title.split(':')[1];
	if (baseBranch !== await getDefaultBranch()) {
		for (const keyword of select.all('.comment-body .issue-keyword[aria-label^="This pull request closes"]')) {
			// This pull request closes issue #51.
			// This pull request closes pull request #52.
			const closingKeyword = keyword.textContent!.trim(); // Keep the keyword as-is (closes, fixes, etc.)
			const [issue] = (/#\d*/.exec((keyword.getAttribute('aria-label')!)))!;
			deduplicatedAuthors.add(closingKeyword + ' ' + issue);
		}
	}

	const cleanedMessage = [...deduplicatedAuthors].join('\n');
	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	messageField.value = cleanedMessage;
	messageField.after(
		<p className="note">
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
