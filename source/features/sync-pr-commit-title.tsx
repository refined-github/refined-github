import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as textFieldEdit from 'text-field-edit';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {logError} from '../libs/utils';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

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
	return `${prTitle} (${getPRNumber()})`;
}

function needsSubmission(): boolean {
	const inputField = getCommitTitleField();
	if (!inputField || inputField.value === '') {
		return false;
	}

	// Ensure that the required fields are on the page
	if (!select.exists(prTitleFieldSelector) || !select.exists(prTitleSubmitSelector)) {
		logError(__filebasename, 'Can’t update the PR title');
		return false;
	}

	return createCommitTitle() !== inputField.value;
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
		textFieldEdit.set(field, createCommitTitle());
	}

	updateUI();
}

function disableSubmission(): void {
	deinit();
	getUI().remove();
}

let listeners: delegate.Subscription[];
function init(): void {
	listeners = [
		onPrMergePanelOpen(updateCommitTitle),
		delegate(document, '#merge_title_field', 'input', updateUI),
		delegate(document, 'form.js-merge-pull-request', 'submit', updatePRTitle),
		delegate(document, '.rgh-sync-pr-commit-title', 'click', disableSubmission)
	];
}

function deinit(): void {
	for (const delegation of listeners) {
		delegation.destroy();
	}

	listeners.length = 0;
}

features.add({
	id: __filebasename,
	description: 'Uses the PR’s title as the default squash commit title and updates the PR’s title to the match the commit title, if changed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
