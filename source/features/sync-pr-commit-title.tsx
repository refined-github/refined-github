import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import onCommitTitleUpdate from '../github-events/on-commit-title-update.js';
import api from '../github-helpers/api.js';
import {getConversationNumber, userCanLikelyMergePr} from '../github-helpers/index.js';
import parseRenderedText from '../github-helpers/parse-rendered-text.js';
import {confirmMergeButton} from '../github-helpers/selectors.js';
import cleanPrCommitTitle from '../helpers/pr-commit-cleaner.js';
import observe from '../helpers/selector-observer.js';
import setReactInputValue from '../helpers/set-react-input-value.js';

const commitTitleFieldSelector = '[data-testid="mergebox-partial"] input[type="text"]';

function getCurrentCommitTitleField(): HTMLInputElement | undefined {
	return $optional(commitTitleFieldSelector);
}

function getCurrentCommitTitle(): string | undefined {
	return getCurrentCommitTitleField()?.value.trim();
}

export function formatPrCommitTitle(title: string, prNumber = getConversationNumber()!): string {
	return `${title} (#${prNumber})`;
}

function createCommitTitle(): string {
	const prTitle = $([
		'h1[class^="prc-PageHeader-Title"] .markdown-title',
		'div[class^="prc-PageLayout-Header"] input',
		// Old view - TODO: Remove after July 2026
		'input#issue_title',
	]);
	const prTitleText = prTitle instanceof HTMLInputElement ? prTitle.value.trim() : parseRenderedText(prTitle);
	return formatPrCommitTitle(prTitleText);
}

function needsSubmission(): boolean {
	const mergeButton = $optional(confirmMergeButton);
	const textContent = mergeButton?.textContent?.trim();
	if (!textContent || ![
		'Confirm squash and merge',
		'Confirm auto-merge (squash)',
		'Confirm bypass rules and merge (squash)',
	].includes(textContent)) {
		return false;
	}

	const currentCommitTitle = getCurrentCommitTitle()!;
	return Boolean(currentCommitTitle) && (createCommitTitle() !== currentCommitTitle);
}

function getUi(): HTMLElement {
	const cancelButton = <button type="button" className="btn-link Link--muted text-underline rgh-sync-pr-commit-title">Cancel</button>;
	return $optional('.rgh-sync-pr-commit-title-note') ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. {cancelButton}
		</p>
	);
}

function updateUi(): void {
	if (needsSubmission()) {
		getCurrentCommitTitleField()!.parentElement!.after(getUi());
	} else {
		getUi().remove();
	}
}

async function updatePrTitle(): Promise<void> {
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
	if (!needsSubmission()) {
		return;
	}

	const field = getCurrentCommitTitleField()!;
	setReactInputValue(field, createCommitTitle());
}

function disableSubmission(): void {
	features.unload(import.meta.url);
	getUi().remove();
}

function init(signal: AbortSignal): void {
	// PR title -> Commit title field
	observe(commitTitleFieldSelector, updateCommitTitle, {signal}); // On panel open
	observe([
		'h1[class^="prc-PageHeader-Title"]',
		'.gh-header-title', // Old view - TODO: Remove after July 2026
	], updateCommitTitle, {signal}); // On PR title change

	// Commit title field -> toggle checkbox visibility
	onCommitTitleUpdate(updateUi, signal);

	// On submission, update PR
	delegate(confirmMergeButton, 'click', updatePrTitle, {signal});

	// On "Cancel", disable the feature
	delegate('.rgh-sync-pr-commit-title', 'click', disableSubmission, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		userCanLikelyMergePr,
	],
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isMergedPR,
	],
	awaitDomReady: true, // DOM-based filters, feature appears at the end of the page
	init,
});

/*

Test URLs:

1. Open any PR in https://github.com/pulls

*/
