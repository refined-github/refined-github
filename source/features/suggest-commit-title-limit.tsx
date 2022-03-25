import './suggest-commit-title-limit.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field', // PR merge message field
].join(',');

function validateInput(): void {
	const inputField = select<HTMLInputElement>(fieldSelector)!;
	inputField.classList.toggle('rgh-title-over-limit', inputField.value.length > 72);
}

function init(): Deinit {
	return delegate(document, fieldSelector, 'input', validateInput);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isEditingFile,
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isPRConversation,
	],
	additionalListeners: [
		// For PR merges, GitHub restores any saved commit messages on page load
		// Triggering input event for these fields immediately validates the form
		onPrMergePanelOpen,
	],
	onlyAdditionalListeners: true,
	deduplicate: 'has-rgh-inner',
	init: validateInput,
});
