import './limit-commit-title-length.css';
import select from 'select-dom';
import features from '../libs/features';

const commitTitleLimit = 72;

function init(): void {
	const inputs = select.all<HTMLInputElement>([
		'#commit-summary-input', // Commit title on edit file page
		'#pull_request_title', // PR title while creating PR
		'#merge_title_field' // PR merge message field
	].join(','));

	for (const inputField of inputs) {
		inputField.setAttribute('maxlength', commitTitleLimit.toString());
		inputField.addEventListener('input', () => {
			const inputValueLength = inputField.value.length;
			let customValidityMessage = '';

			if (inputValueLength > commitTitleLimit) {
				customValidityMessage = `The title should not be longer than 72 characters, but is currently ${inputValueLength} characters`;
			}

			inputField.setCustomValidity(customValidityMessage);
		});
	}
}

features.add({
	id: 'limit-commit-title-length',
	description: 'Limits the length of commit fields to 70 characters',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isPRConversation,
		features.isCompare,
		features.isEditingFile
	]
});
