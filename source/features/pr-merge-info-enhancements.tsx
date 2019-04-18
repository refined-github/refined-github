import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

// Update the field and dispatches the right events (focus is also used by `fit-textareas`)
function updateField(field: HTMLTextAreaElement | HTMLInputElement, value: string) {
	field.value = value;
	field.focus();
	field.dispatchEvent(new InputEvent('input'));
}

function update() {
	const title = select('.js-issue-title')!.textContent!;
	const number = select('.gh-header-number')!.textContent!;
	const description = select('.comment-form-textarea[name=\'pull_request[body]\']')!.textContent!;

	updateField(
		select<HTMLInputElement>('#merge_title_field')!,
		`${title.trim()} (${number})`
	);

	updateField(
		select<HTMLTextAreaElement>('#merge_message_field')!,
		description.trim()
	);
}

function init() {
	delegate(`
		.js-merge-pr.is-squashing,
		.js-merge-pr.is-merging
	`, 'details:toggled', update);
}

features.add({
	id: 'pr-merge-info-enhancements',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
