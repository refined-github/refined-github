import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import regexJoin from 'regex-join';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';
import {getConversationNumber} from '../github-helpers';
import onPrCommitMessageRestore from '../github-events/on-pr-commit-message-restore';

const mergeFormSelector = '.is-squashing form:not([hidden])';
const prTitleFieldSelector = '.js-issue-update input[name="issue[title]"]';
const prTitleSubmitSelector = '.js-issue-update button[type="submit"]';

function getCommitTitleField(): HTMLInputElement | undefined {
	return select(`${mergeFormSelector} input#merge_title_field`);
}

function createCommitTitle(): string {
	const prTitle = select(prTitleFieldSelector)!.value.trim();
	return `${prTitle} (#${getConversationNumber()!})`;
}

function needsSubmission(): boolean {
	const inputField = getCommitTitleField();
	if (!inputField || inputField.value === '') {
		return false;
	}

	// Ensure that the required fields are on the page
	if (!select.exists(prTitleFieldSelector + ',' + prTitleSubmitSelector)) {
		features.log.error(import.meta.url, 'Can’t update the PR title');
		return false;
	}

	return createCommitTitle() !== inputField.value;
}

function getUI(): HTMLElement {
	return select(`${mergeFormSelector} .rgh-sync-pr-commit-title-note`) ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. <button type="button" className="btn-link Link--muted text-underline rgh-sync-pr-commit-title">Cancel</button>
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
		.replace(regexJoin(/\s*\(/, '#' + getConversationNumber()!, /\)$/), '');

	// Fill and submit title-change form
	select(prTitleFieldSelector)!.value = prTitle;
	select(prTitleSubmitSelector)!.click(); // `form.submit()` isn't sent via ajax
}

async function updateCommitTitle(): Promise<void> {
	const field = getCommitTitleField()!;
	if (field) {
		textFieldEdit.set(field, createCommitTitle());
	}

	updateUI();
}

function disableSubmission(): void {
	deinit();
	getUI().remove();
}

const subscriptions: delegate.Subscription[] = [];

function init(): Deinit {
	subscriptions.push(
		onPrCommitMessageRestore(updateUI),
		onPrMergePanelOpen(updateCommitTitle),
		delegate(document, '#merge_title_field', 'input', updateUI),
		delegate(document, 'form.js-merge-pull-request', 'submit', updatePRTitle),
		delegate(document, '.rgh-sync-pr-commit-title', 'click', disableSubmission),
	);

	return deinit;
}

function deinit(): void {
	for (const subscription of subscriptions) {
		subscription.destroy();
	}

	subscriptions.length = 0;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
