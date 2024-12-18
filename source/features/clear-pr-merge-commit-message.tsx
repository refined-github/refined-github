import React from 'dom-chef';
import {countElements} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import cleanCommitMessage from '../helpers/clean-commit-message.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {expectToken} from '../github-helpers/github-token.js';
import attachElement from '../helpers/attach-element.js';

const isPrAgainstDefaultBranch = async (): Promise<boolean> => getBranches().base.branch === await getDefaultBranch();

async function clear(event: DelegateEvent<CustomEvent, HTMLTextAreaElement>): Promise<void | false> {
	if (event.detail?.open !== true) {
		return;
	}

	const messageField = $('textarea#merge_message_field', event.delegateTarget);
	const originalMessage = messageField.value;
	if (!originalMessage.trim()) {
		return;
	}

	const cleanedMessage = cleanCommitMessage(originalMessage, !await isPrAgainstDefaultBranch());

	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	// Do not use `text-field-edit` #6348
	messageField.value = cleanedMessage ? cleanedMessage + '\n' : '';

	// Trigger `fit-textareas` if enabled
	messageField.dispatchEvent(new Event('input', {bubbles: true}));

	attachElement(messageField, {
		after: () => (
			<div>
				<p className="note">
					The description field was cleared by <a target="_blank" href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message" rel="noreferrer">Refined GitHub</a>.
				</p>
				<hr />
			</div>
		),
	});
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	delegate('.js-merge-pr', 'details:toggled', clear, {signal});
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
