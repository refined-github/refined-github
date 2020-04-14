import './suggest-commit-title-limit.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field' // PR merge message field
].join();

function validateInput({delegateTarget: inputField}: delegate.Event<InputEvent, HTMLInputElement>): void {
	inputField.classList.toggle('rgh-title-over-limit', inputField.value.length > 72);
}

function triggerValidation(): void {
	select(fieldSelector)!.dispatchEvent(new Event('input'));
}

function init(): void {
	delegate(document, fieldSelector, 'input', validateInput);

	// For PR merges, GitHub restores any saved commit messages on page load
	// Triggering input event for these fields immediately validates the form
	onPrMergePanelOpen(triggerValidation);
}

features.add({
	id: __featureName__,
	description: 'Suggest limiting commit titles to 72 characters.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/60379478-106b3280-9a51-11e9-88b9-0e3607f214cd.gif'
}, {
	include: [
		features.isPRConversation,
		features.isEditingFile
	],
	load: features.onAjaxedPages,
	init
});
