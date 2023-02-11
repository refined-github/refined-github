import React from 'dom-chef';
import select from 'select-dom';
import {set} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getBranches} from '../github-helpers/pr-branches';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {upperCaseFirst} from '../github-helpers';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';
import attachElement from '../helpers/attach-element';

async function init(): Promise<void | false> {
	// Only run once so that it doesn't clear the field every time it's opened
	features.unload(import.meta.url);

	const messageField = select('textarea#merge_message_field')!;
	const originalMessage = messageField.value;
	const preservedContent = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of originalMessage.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		preservedContent.add('Co-authored-by: ' + author);
	}

	// Preserve closing issues numbers when a PR is merged into a non-default branch since GitHub doesn't close them #4531
	if (getBranches().base.branch !== await getDefaultBranch()) {
		for (const keyword of select.all('.comment-body .issue-keyword[aria-label^="This pull request closes"]')) {
			const closingKeyword = keyword.textContent!.trim(); // Keep the keyword as-is (closes, fixes, etc.)
			const sibling = keyword.nextElementSibling!;

			// Get the full URL so it works on issues not in the same repo
			const issueLink = sibling instanceof HTMLAnchorElement ? sibling : select('a', sibling)!;
			preservedContent.add([
				upperCaseFirst(closingKeyword),
				issueLink.href,
			].join(' '));
		}
	}

	const cleanedMessage = [...preservedContent].join('\n');
	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	set(messageField, cleanedMessage);
	attachElement(messageField, {
		after: () => (
			<div>
				<p className="note">
					The description field was cleared by <a target="_blank" href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message" rel="noreferrer">Refined GitHub</a>.
				</p>
				<hr/>
			</div>
		),
	});
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
