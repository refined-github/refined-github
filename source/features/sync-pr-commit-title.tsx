import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import {getConversationNumber, userCanLikelyMergePR} from '../github-helpers/index.js';
import onCommitTitleUpdate from '../github-events/on-commit-title-update.js';
import observe from '../helpers/selector-observer.js';
import cleanPrCommitTitle from '../helpers/pr-commit-cleaner.js';
import setReactInputValue from '../helpers/set-react-input-value.js';

const prTitleFieldSelector = 'input#issue_title';
const commitTitleFieldSelector = '[class^="MergeBox-module__mergePartialContainer"] input';
const mergeButtonSelector = '[class^="MergeBox-module__mergePartialContainer"] button[data-variant="primary"]';

function getCurrentCommitTitleField(): HTMLInputElement | undefined {
	const mergeButton = $optional(mergeButtonSelector);
	if (mergeButton?.textContent === 'Confirm squash and merge') {
		return $optional(commitTitleFieldSelector);
	}

	// eslint-disable-next-line no-useless-return -- "Not all code paths return a value. ts(7030)" if removed
	return;
}

function getCurrentCommitTitle(): string | undefined {
	return getCurrentCommitTitleField()?.value.trim();
}

export function formatPrCommitTitle(title: string, prNumber = getConversationNumber()!): string {
	return `${title} (#${prNumber})`;
}

function createCommitTitle(): string {
	const prTitle = $(prTitleFieldSelector).value.trim();
	return formatPrCommitTitle(prTitle);
}

function needsSubmission(): boolean {
	const currentCommitTitle = getCurrentCommitTitle();
	return Boolean(currentCommitTitle) && (createCommitTitle() !== currentCommitTitle);
}

function getUI(): HTMLElement {
	const cancelButton = <button type="button" className="btn-link Link--muted text-underline rgh-sync-pr-commit-title">Cancel</button>;
	return $optional('.rgh-sync-pr-commit-title-note') ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. {cancelButton}
		</p>
	);
}

function updateUI(): void {
	if (needsSubmission()) {
		getCurrentCommitTitleField()!.parentElement!.after(getUI());
	} else {
		getUI().remove();
	}
}

async function updatePRTitle(): Promise<void> {
	if (!needsSubmission()) {
		return;
	}

	// Remove PR number from commit title
	const title = cleanPrCommitTitle(getCurrentCommitTitle()!, getConversationNumber()!);

	await api.v3(`pulls/${getConversationNumber()!}`, {
		method: 'PATCH',
		body: {title},
	});
}

async function updateCommitTitle(): Promise<void> {
	const field = getCurrentCommitTitleField();
	if (field) {
		setReactInputValue(field, createCommitTitle());
	}
}

function disableSubmission(): void {
	features.unload(import.meta.url);
	getUI().remove();
}

function init(signal: AbortSignal): void {
	// PR title -> Commit title field
	observe(commitTitleFieldSelector, updateCommitTitle, {signal}); // On panel open
	observe('.gh-header-title', updateCommitTitle, {signal}); // On PR title change

	// Commit title field -> toggle checkbox visibility
	onCommitTitleUpdate(updateUI, signal);

	// On submission, update PR
	delegate('mergeButtonSelector', 'click', updatePRTitle, {signal});

	// On "Cancel", disable the feature
	delegate('.rgh-sync-pr-commit-title', 'click', disableSubmission, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		userCanLikelyMergePR,
	],
	include: [
		pageDetect.isPRConversation,
	],
	awaitDomReady: true, // DOM-based filters, feature appears at the end of the page
	init,
});

/*

Test URLs:

1. Open any PR in https://github.com/pulls

*/
