import './limit-commit-title-length.css';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const inputs = select.all<HTMLInputElement>([
		'#commit-summary-input', // Commit title on edit file page
		'#pull_request_title', // PR title while creating PR
		'#merge_title_field' // PR merge message field
	].join(','));

	for (const inputField of inputs) {
		inputField.setAttribute('maxlength', '70');
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
