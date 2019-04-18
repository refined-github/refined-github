import React from 'dom-chef';
import select from 'select-dom';
import debounce from 'debounce-fn';
import delegate from 'delegate-it';
import features from '../libs/features';

const inputMap = new WeakMap();

const createCommitTitle = debounce((): string => {
	const title = select('.js-issue-title')!.textContent!;
	const number = getPRNumber();
	return `${title.trim()} (${number})`;
}, {
	wait: 1000,
	immediate: true
}) as () => string;

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

// Updates the field and dispatches the right events (focus is also used by `fit-textareas`)
function updateField(field: HTMLTextAreaElement | HTMLInputElement, value: string): void {
	field.value = value;
	field.focus();
	field.dispatchEvent(new InputEvent('input'));
}

function updateCommit(): void {
	updateField(
		select<HTMLInputElement>('#merge_title_field')!,
		createCommitTitle()
	);

	updateField(
		select<HTMLTextAreaElement>('#merge_message_field')!,
		select('.comment-form-textarea[name=\'pull_request[body]\']')!.textContent!.trim()
	);
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
		inputField.after(note)
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


// GitHub automatically restores value from the previous session and opens the form
function restoreSession() {
	document.addEventListener('session:resume', debounce(showNote));
}

function init() {
	delegate('#discussion_bucket', `
		.js-merge-pr.is-squashing,
		.js-merge-pr.is-merging
	`, 'details:toggled', updateCommit);

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

features.add({
	id: 'pr-merge-info-enhancements',
	include: [
		features.isPRConversation
	],
	init: restoreSession
});
