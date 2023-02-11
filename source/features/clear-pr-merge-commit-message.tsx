import React from 'dom-chef';
import select from 'select-dom';
import {set} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getBranches} from '../github-helpers/pr-branches';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';
import attachElement from '../helpers/attach-element';

const isPrAgainstDefaultBranch = async (): Promise<boolean> => getBranches().base.branch === await getDefaultBranch();

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
	if (!await isPrAgainstDefaultBranch()) {
		// https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests#linking-a-pull-request-to-an-issue
		for (const [line] of originalMessage.matchAll(/(fix(es|ed)?|close[sd]?|resolve[sd]?)([^\n]+)/gi)) {
			// Ensure it includes a reference or URL
			if (/#\d+/.test(line) || line.includes('http')) {
				preservedContent.add(line);
			}
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

/*

Test URLs

PR against non-default branch:
https://github.com/refined-github/sandbox/pull/53

*/
