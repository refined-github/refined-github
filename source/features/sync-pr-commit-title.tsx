/*
Use the PR’s title when merging
https://github.com/sindresorhus/refined-github/issues/276

Update the PR’s title to the merge commit title, if changed.
https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import debounce from 'debounce-fn';
import delegate, {DelegateSubscription} from 'delegate-it';
import insertTextTextarea from 'insert-text-textarea';
import fitTextarea from 'fit-textarea';
import features from '../libs/features';

const createCommitTitle = debounce<[], string>((): string =>
	`${select('.js-issue-title')!.textContent!.trim()} (${getPRNumber()})`
, {
	wait: 1000,
	immediate: true
});

const getNote = onetime<[], HTMLElement>((): HTMLElement =>
	<p className="note">
		The title of this PR will be updated to match this title. <button type="button" className="btn-link muted-link text-underline" onClick={event => {
			deinit();
			event.currentTarget.parentElement!.remove(); // Hide note
		}}>Cancel</button>
	</p>
);

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

function maybeShowNote(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;
	const needsSubmission = createCommitTitle() !== inputField.value;

	if (needsSubmission) {
		inputField.after(getNote());
		return;
	}

	if (select.all('.edit-issue-title, .js-issue-update [type="submit"]').length !== 2) {
		// Ensure that the required fields are there before adding the note
		throw new Error('Refined GitHub: `sync-pr-commit-title` is broken');
	}

	getNote().remove();
}

function submitPRTitleUpdate(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;

	// If the note isn't shown, the PR title doesn't need to be updated
	if (!getNote().parentElement) {
		return;
	}

	const prTitle = inputField.value.replace(new RegExp(`\\s*\\(${getPRNumber()}\\)$`), '');

	// Fill and submit title-change form
	select<HTMLInputElement>('.edit-issue-title')!.value = prTitle;
	select('.js-issue-update [type="submit"]')!.click(); // `form.submit()` isn't sent via ajax
}

function triggerFitTextareas(): void {
	fitTextarea(select<HTMLTextAreaElement>('#merge_message_field')!);
}

function onMergePanelToggle(event: CustomEvent): void {
	if (!event.detail.open) {
		return;
	}

	triggerFitTextareas();

	// Replace default title and fire the correct events
	const field = select<HTMLTextAreaElement>('.merge-branch-form:not(.is-dirty) #merge_title_field')!;
	field.focus();
	field.select();
	insertTextTextarea(field, createCommitTitle());
}

async function onResume(): Promise<void> {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	maybeShowNote();
	triggerFitTextareas();
}

let listeners: DelegateSubscription[];
function init(): void {
	listeners = [
		...delegate('#discussion_bucket', '#merge_title_field', 'input', maybeShowNote),
		...delegate('#discussion_bucket', 'form.js-merge-pull-request', 'submit', submitPRTitleUpdate),
		...delegate('#discussion_bucket', '.js-merge-pr:not(.is-rebasing)', 'details:toggled', onMergePanelToggle)
	];
}

function deinit(): void {
	for (const delegation of listeners) {
		delegation.destroy();
	}

	listeners.length = 0;
}

features.add({
	id: 'sync-pr-commit-title',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});

// GitHub automatically restores value from the previous session and opens the form
features.add({
	id: 'sync-pr-commit-title',
	include: [
		features.isPRConversation
	],
	init: () => document.addEventListener('session:resume', onResume)
});
