import React from 'dom-chef';
import {countElements} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import cleanCommitMessage from '../helpers/clean-commit-message.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {expectToken} from '../github-helpers/github-token.js';
import attachElement from '../helpers/attach-element.js';
import observe from '../helpers/selector-observer.js';

const isPrAgainstDefaultBranch = async (): Promise<boolean> => getBranches().base.branch === await getDefaultBranch();

async function clear(messageField: HTMLTextAreaElement): Promise<void> {
	const originalMessage = messageField.value;
	const cleanedMessage = cleanCommitMessage(originalMessage, !await isPrAgainstDefaultBranch());

	if (cleanedMessage === originalMessage.trim()) {
		return;
	}

	// Do not use `text-field-edit` #6348
	messageField.value = cleanedMessage ? cleanedMessage + '\n' : '';

	// Trigger `fit-textareas` if enabled
	messageField.dispatchEvent(new Event('input', {bubbles: true}));

	const anchor = messageField.closest('div[data-has-label]')!;

	attachElement(anchor, {
		after: () => (
			<div className='flex-self-stretch'>
				<p className='note'>
					The description field was cleared by <a target='_blank' href='https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message' rel='noreferrer'>Refined GitHub</a>.
				</p>
			</div>
		),
	});
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('textarea[placeholder="Add an optional extended description…"]', clear, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		userHasPushAccess,
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => countElements('.TimelineItem.js-commit') === 1,
	],
	awaitDomReady: true, // Appears near the end of the page anyway
	init,
});

/*

Test URLs

PR against non-default branch:
https://github.com/refined-github/sandbox/pull/53

*/
