import './limit-commit-title-length.css';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field' // PR merge message field
].join();

function validateInput({delegateTarget: inputField}: DelegateEvent<InputEvent, HTMLInputElement>): void {
	inputField.setCustomValidity(inputField.value.length > 72 ? `The title should be maximum 72 characters, but is ${inputField.value.length}` : '');
}

function triggerValidation(): void {
	select(fieldSelector)!.dispatchEvent(new Event('input'));
}

function init(): void {
	delegate(fieldSelector, 'input', validateInput);

	// For PR merges, GitHub restores any saved commit messages on page load
	// Triggering input event for these fields immediately validates the form
	onPrMergePanelOpen(triggerValidation);
}

features.add({
	id: __featureName__,
	description: 'Limits the commit title fields to 72 characters.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/60379478-106b3280-9a51-11e9-88b9-0e3607f214cd.gif'
}, {
	include: [
		features.isPRConversation,
		features.isEditingFile
	],
	load: features.onAjaxedPages,
	init
});
