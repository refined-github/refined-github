import React from 'dom-chef';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import cleanCommitMessage from '../helpers/clean-commit-message.js';
import {userCanLikelyMergePR} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const isPrAgainstDefaultBranch = async (): Promise<boolean> => getBranches().base.branch === await getDefaultBranch();

async function clear(messageField: HTMLTextAreaElement): Promise<void | false> {
	// Only run once so that it doesn't clear the field every time it's opened
	features.unload(import.meta.url);

	const originalMessage = messageField.value;
	const cleanedMessage = cleanCommitMessage(originalMessage, !await isPrAgainstDefaultBranch());

	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	// Do not use `text-field-edit` #6348
	messageField.value = cleanedMessage ? cleanedMessage + '\n' : '';

	// Trigger `fit-textareas` if enabled
	messageField.dispatchEvent(new Event('input', {bubbles: true}));

	messageField.after(
		<div>
			<p className="note">
				The description field was cleared by <a target="_blank" href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message" rel="noreferrer">Refined GitHub</a>.
			</p>
			<hr/>
		</div>,
	);
}

function init(signal: AbortSignal): void {
	observe('textarea#merge_message_field', clear, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		userCanLikelyMergePR,
	],
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => $$('.TimelineItem.js-commit').length === 1,
	],
	awaitDomReady: true, // Appears near the end of the page anyway
	init,
});

/*

Test URLs

PR against non-default branch:
https://github.com/refined-github/sandbox/pull/53

*/
