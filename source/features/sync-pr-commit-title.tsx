import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateSubscription} from 'delegate-it';
import insertTextTextarea from 'insert-text-textarea';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';
import {logError} from '../libs/utils';

const commitTitleLimit = 72;
const prTitleFieldSelector = '.js-issue-update [name="issue[title]"]';
const prTitleSubmitSelector = '.js-issue-update [type="submit"]';

function getCommitTitleField(): HTMLInputElement | undefined {
	return select<HTMLInputElement>('.is-squashing #merge_title_field') ?? undefined;
}

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

function createCommitTitle(): string {
	const prTitle = select('.js-issue-title')!.textContent!.trim();
	const prInfo = ` (${getPRNumber()})`;
	const targetTitleLength = commitTitleLimit - prInfo.length;

	if (prTitle.length > targetTitleLength) {
		return prTitle.slice(0, targetTitleLength - 1).trim() + '…' + prInfo;
	}

	return prTitle + prInfo;
}

function needsSubmission(): boolean {
	const inputField = getCommitTitleField();
	if (!inputField || inputField.value === '') {
		return false;
	}

	// Ensure that the required fields are on the page
	if (!select.exists(prTitleFieldSelector) || !select.exists(prTitleSubmitSelector)) {
		logError(__featureName__, 'Can’t update the PR title');
		return false;
	}

	// If the commit title was clipped, be more lenient when comparing it to the PR title.
	// If the user doesn't change the clipped commit title, the PR doesn't need to change.
	const commitTitle = createCommitTitle();
	if (commitTitle.includes('…')) {
		return !inputField.value.startsWith(commitTitle.replace(/….+/, ''));
	}

	return commitTitle !== inputField.value;
}

function getUI(): HTMLElement {
	return select('.note.rgh-sync-pr-commit-title-note') ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. <button type="button" className="btn-link muted-link text-underline rgh-sync-pr-commit-title">Cancel</button>
		</p>
	);
}

function updateUI(): void {
	if (needsSubmission()) {
		getCommitTitleField()!.after(getUI());
	} else {
		getUI().remove();
	}
}

function updatePRTitle(): void {
	if (!needsSubmission()) {
		return;
	}

	// Remove PR number from commit title
	const prTitle = getCommitTitleField()!.value
		.replace(new RegExp(`\\s*\\(${getPRNumber()}\\)$`), '');

	// Fill and submit title-change form
	select<HTMLInputElement>(prTitleFieldSelector)!.value = prTitle;
	select(prTitleSubmitSelector)!.click(); // `form.submit()` isn't sent via ajax
}

async function updateCommitTitle(event: Event): Promise<void> {
	const field = getCommitTitleField();

	// Only if the user hasn't already interacted with it in this session
	if (field && event.type !== 'session:resume') {
		// Replace default title and fire the correct events
		field.select();
		insertTextTextarea(field, createCommitTitle());
	}

	updateUI();
}

function disableSubmission(): void {
	deinit();
	getUI().remove(); // Hide note
}

let listeners: DelegateSubscription[];
function init(): void {
	listeners = [
		onPrMergePanelOpen(updateCommitTitle),
		delegate('#merge_title_field', 'input', updateUI),
		delegate('form.js-merge-pull-request', 'submit', updatePRTitle),
		delegate('.rgh-sync-pr-commit-title', 'click', disableSubmission)
	];
}

function deinit(): void {
	for (const delegation of listeners) {
		delegation.destroy();
	}

	listeners.length = 0;
}

features.add({
	id: __featureName__,
	description: 'Uses the PR’s title as the default squash commit title and updates the PR’s title to the match the commit title, if changed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png'
}, {
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
