/*
Use the PR’s title and description when merging and update the PR’s title to the merge commit title, if changed.

https://github.com/sindresorhus/refined-github/issues/276

https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import debounce from 'debounce-fn';
import delegate from 'delegate-it';
import features from '../libs/features';

const inputMap = new WeakMap();

const createCommitTitle = debounce((): string =>
	`${select('.js-issue-title')!.textContent!.trim()} (${getPRNumber()})`
, {
	wait: 1000,
	immediate: true
}) as () => string;

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

// Updates the field and dispatches the right events (focus is also used by `fit-textareas`)
function updateField(selector: string, value: string): void {
	const field = select<HTMLTextAreaElement | HTMLInputElement>(selector)!;
	field.value = value;
	field.focus();
	field.dispatchEvent(new InputEvent('input'));
}

function updateCommitInfo(): void {
	const firstMessage = select('.comment-form-textarea[name=\'pull_request[body]\']')!.textContent!.trim();
	updateField('#merge_message_field', firstMessage);
	updateField('#merge_title_field', createCommitTitle()); // Called last, leaves the title field focused
}

function showNote(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;
	const needsUpdate = createCommitTitle() !== inputField.value;

	const note: HTMLElement = inputMap.get(inputField) || (
		<p className="note">
			The title of this PR will be updated to match this title. <button type="button" className="btn-link muted-link text-underline" onClick={() => {
				note.hidden = true;
			}}>Cancel</button>
		</p>
	);
	inputMap.set(inputField, note);

	// The `hidden` attribute is used to remember the user's Cancellation
	if (needsUpdate && !note.hidden) {
		inputField.after(note);
	} else {
		note.remove();
	}
}

function updatePR() {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;
	const note = inputMap.get(inputField);
	if (!note || !note.parentElement) {
		return;
	}

	const prTitle = inputField.value.replace(new RegExp(`\\s*\\(${getPRNumber()}\\)$`), '');

	// Fill and submit title-change form
	select<HTMLInputElement>('.edit-issue-title')!.value = prTitle;
	select('.js-issue-update [type="submit"]')!.click(); // `form.submit()` isn't sent via ajax
}

function init() {
	delegate('#discussion_bucket', '.js-merge-pr:not(is-rebasing)', 'details:toggled', updateCommitInfo);
	delegate('#discussion_bucket', '#merge_title_field', 'input', showNote);
	delegate('#discussion_bucket', 'form.js-merge-pull-request', 'submit', updatePR);
}

features.add({
	id: 'pr-merge-info-enhancements',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});

// GitHub automatically restores value from the previous session and opens the form
features.add({
	id: 'pr-merge-info-enhancements',
	include: [
		features.isPRConversation
	],
	init: () => document.addEventListener('session:resume', debounce(showNote))
});
