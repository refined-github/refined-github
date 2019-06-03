import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';

const getError = onetime<[], HTMLElement>((): HTMLElement =>
	<p className="note text-red">Title of commit should be less than 70 characters.</p>
);

function init(): void {
	const inputs = select.all<HTMLInputElement>([
		'#commit-summary-input', // Commit title on edit file page
		'#pull_request_title', // PR title while creating PR
		'#merge_title_field' // PR merge message field
	].join(','));

	for (const inputField of inputs) {
		const validityCallback = (): void => {
			if (inputField.checkValidity()) {
				getError().remove();
				return;
			}

			inputField.after(getError());
		};

		inputField.setAttribute('maxlength', '70');

		inputField.addEventListener('input', validityCallback);

		validityCallback();
	}
}

features.add({
	id: 'limit-commit-title-length',
	description: 'Limits the length of commit fields to 70 characters',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isPRConversation,
		features.isPRFiles,
		features.isCompare,
		features.isEditingFile
	]
});
