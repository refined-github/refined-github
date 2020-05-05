import './suggest-commit-title-limit.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field' // PR merge message field
].join();

function validateInput(): void {
	const inputField = select<HTMLInputElement>(fieldSelector)!;
	inputField.classList.toggle('rgh-title-over-limit', inputField.value.length > 72);
}

function init(): void {
	delegate(document, fieldSelector, 'input', validateInput);
}

features.add({
	id: __filebasename,
	description: 'Suggest limiting commit titles to 72 characters.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/60379478-106b3280-9a51-11e9-88b9-0e3607f214cd.gif'
}, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isPRConversation
	],
	init
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		// For PR merges, GitHub restores any saved commit messages on page load
		// Triggering input event for these fields immediately validates the form
		onPrMergePanelOpen
	],
	onlyAdditionalListeners: true,
	init: validateInput
});
