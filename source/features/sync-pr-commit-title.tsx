import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import onCommitTitleUpdate from '../github-events/on-commit-title-update.js';
import api from '../github-helpers/api.js';
import {getConversationNumber, userCanLikelyMergePr} from '../github-helpers/index.js';
import parseRenderedText from '../github-helpers/parse-rendered-text.js';
import {confirmMergeButton} from '../github-helpers/selectors.js';
import cleanPrCommitTitle from '../helpers/pr-commit-cleaner.js';
import observe from '../helpers/selector-observer.js';
import {setReactInputValue} from '../helpers/set-react-text-field-value.js';

const commitTitleFieldSelector = '[data-testid="mergebox-partial"] input[type="text"]';

function getCurrentCommitTitle(): string {
	return $(commitTitleFieldSelector).value.trim();
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
	// `needsSubmission` is also called when the PR title is changed, in order to update the open merge box in real time
	if (!/squash/i.test($optional(confirmMergeButton)?.textContent ?? '')) {
		return false;
	}

	const currentCommitTitle = getCurrentCommitTitle();
	return Boolean(currentCommitTitle) && (createCommitTitle() !== currentCommitTitle);
}

function getUi(): HTMLElement {
	const cancelButton = <button type="button" className="btn-link Link--muted text-underline rgh-sync-pr-commit-title">
		Cancel
	</button>;
	return $optional('.rgh-sync-pr-commit-title-note') ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. {cancelButton}
		</p>
	);
}

function updateUi(): void {
	if (needsSubmission()) {
		$(commitTitleFieldSelector).parentElement!.after(getUi());
	} else {
		getUi().remove();
	}
}

async function updatePrTitle(): Promise<void> {
	if (!needsSubmission()) {
		return;
	}

	// Remove PR number from commit title
	const title = cleanPrCommitTitle(getCurrentCommitTitle(), getConversationNumber()!);

	await api.v3(`pulls/${getConversationNumber()!}`, {
		method: 'PATCH',
		body: {title},
	});
}

async function updateCommitTitle(): Promise<void> {
	if (!needsSubmission()) {
		return;
	}

	const field = $(commitTitleFieldSelector);
	setReactInputValue(field, createCommitTitle());
}

function disableSubmission(): void {
	features.unload(import.meta.url);
	getUi().remove();
}

function init(signal: AbortSignal): void {
	// PR title -> Commit title field
	// On panel open
	observe(commitTitleFieldSelector, updateCommitTitle, {signal});

	// On PR title change
	observe(
		[
			'h1[class^="prc-PageHeader-Title"]',
			'.gh-header-title', // Old view - TODO: Remove after July 2026
		],
		updateCommitTitle,
		{signal},
	);

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
