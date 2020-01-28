import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateSubscription, DelegateEvent} from 'delegate-it';
import insertTextTextarea from 'insert-text-textarea';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';
import {logError} from '../libs/utils';

const commitTitleLimit = 72;
const prTitleFieldSelector = '.js-issue-update [name="issue[title]"]';
const prTitleSubmitSelector = '.js-issue-update [type="submit"]';

function createCommitTitle(): string {
	const prTitle = select('.js-issue-title')!.textContent!.trim();
	const prInfo = ` (${getPRNumber()})`;
	const targetTitleLength = commitTitleLimit - prInfo.length;

	if (prTitle.length > targetTitleLength) {
		return prTitle.slice(0, targetTitleLength - 1).trim() + '…' + prInfo;
	}

	return prTitle + prInfo;
}

function getNote(): HTMLElement {
	return select('.note.rgh-sync-pr-commit-title-note') ?? (
		<p className="note rgh-sync-pr-commit-title-note">
			The title of this PR will be updated to match this title. <button type="button" className="btn-link muted-link text-underline rgh-sync-pr-commit-title">Cancel</button>
		</p>
	);
}

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

function handleCancelClick(event: DelegateEvent): void {
	deinit();
	event.delegateTarget.parentElement!.remove(); // Hide note
}

function needsSubmission(): boolean {
	const inputField = select<HTMLTextAreaElement>('.is-squashing #merge_title_field');
	if (!inputField) {
		return false;
	}

	return createCommitTitle() !== inputField.value;
}

function maybeShowNote(): void {
	if (!needsSubmission()) {
		getNote().remove();
		return;
	}

	// Ensure that the required fields are there before adding the note
	if (select.all([prTitleFieldSelector, prTitleSubmitSelector].join()).length === 2) {
		select<HTMLInputElement>('#merge_title_field')!.after(getNote());
		return;
	}
	
	logError(__featureName__, 'Can’t update the PR title');
}

function submitPRTitleUpdate(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;

	// If the note isn't shown, the PR title doesn't need to be updated
	if (!getNote().isConnected) {
		return;
	}

	const prTitle = inputField.value.replace(new RegExp(`\\s*\\(${getPRNumber()}\\)$`), '');

	// Fill and submit title-change form
	select<HTMLInputElement>(prTitleFieldSelector)!.value = prTitle;
	select(prTitleSubmitSelector)!.click(); // `form.submit()` isn't sent via ajax
}

async function onMergePanelOpen(event: Event): Promise<void> {
	const field = select<HTMLTextAreaElement>('.is-squashing #merge_title_field');
	if (!field) {
		maybeShowNote();
		return;
	}

	// Wait for field to be restored first, otherwise it's never dirty
	await new Promise(resolve => setTimeout(resolve));

	// Only if the user hasn't already interacted with it in this session
	if (!field.closest('.is-dirty') && event.type !== 'session:resume') {
		// Replace default title and fire the correct events
		field.select();
		insertTextTextarea(field, createCommitTitle());
	}

	maybeShowNote();
}

let listeners: DelegateSubscription[];
function init(): void {
	listeners = [
		delegate('#merge_title_field', 'input', maybeShowNote),
		delegate('form.js-merge-pull-request', 'submit', submitPRTitleUpdate),
		delegate('.rgh-sync-pr-commit-title', 'click', handleCancelClick),
		onPrMergePanelOpen(onMergePanelOpen)
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
	description: 'When squashing PRs, it will suggest to have the same PR’s title and merge commit title.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
