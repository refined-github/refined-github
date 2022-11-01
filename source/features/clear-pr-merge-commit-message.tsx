import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import {getBranches} from './update-pr-from-base-branch';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

async function init(): Promise<void | false> {
	const messageField = select('textarea#merge_message_field')!;
	const originalMessage = messageField.value;
	const preservedContent = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of originalMessage.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		preservedContent.add('Co-authored-by: ' + author);
	}

	// Preserve closing issues numbers when a PR is merged into a non-default branch since GitHub doesn't close them #4531
	if (getBranches().base !== await getDefaultBranch()) {
		for (const keyword of select.all('.comment-body .issue-keyword[aria-label^="This pull request closes"]')) {
			const closingKeyword = keyword.textContent!.trim(); // Keep the keyword as-is (closes, fixes, etc.)

			const issueNumberElement = keyword.nextElementSibling as HTMLAnchorElement;
			const isCrossRepo = getRepo(issueNumberElement)!.nameWithOwner !== getRepo()!.nameWithOwner;
			const issueNumber = isCrossRepo ? issueNumberElement.href : issueNumberElement.textContent!;
			preservedContent.add(closingKeyword + ' ' + issueNumber);
		}
	}

	const cleanedMessage = [...preservedContent].join('\n');
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
