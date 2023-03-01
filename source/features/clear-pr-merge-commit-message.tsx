import React from 'dom-chef';
import select from 'select-dom';
import {set} from 'text-field-edit';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getBranches} from '../github-helpers/pr-branches';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';
import attachElement from '../helpers/attach-element';
import cleanCommitMessage from '../helpers/clean-commit-message';
import {userCanLikelyMergePR} from '../github-helpers';

const isPrAgainstDefaultBranch = async (): Promise<boolean> => getBranches().base.branch === await getDefaultBranch();

async function init(): Promise<void | false> {
	// Only run once so that it doesn't clear the field every time it's opened
	features.unload(import.meta.url);

	const messageField = select('textarea#merge_message_field')!;
	const originalMessage = messageField.value;
	const cleanedMessage = cleanCommitMessage(originalMessage, !await isPrAgainstDefaultBranch());

	if (cleanedMessage === originalMessage.trim()) {
		return false;
	}

	set(messageField, cleanedMessage ? cleanedMessage + '\n' : '');
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
	asLongAs: [
		userCanLikelyMergePR,
	],
	additionalListeners: [
		onPrMergePanelOpen,
	],
	onlyAdditionalListeners: true,
	awaitDomReady: true, // Appears near the page anyway
	init,
});

/*

Test URLs

PR against non-default branch:
https://github.com/refined-github/sandbox/pull/53

*/
