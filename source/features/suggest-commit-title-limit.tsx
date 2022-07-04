import './suggest-commit-title-limit.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrCommitMessageRestore from '../github-events/on-pr-commit-message-restore';

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
		// For PR merges, GitHub restores any modified commit messages on page load
		onPrCommitMessageRestore,
	],
	onlyAdditionalListeners: true,
	deduplicate: 'has-rgh-inner',
	init: validateInput,
});

/*

# Test data

## Commit title

123456789 123456789 123456789 123456789 123456789 123456789 123456789 123

## URLs

- Any mergeable PR
- https://github.com/refined-github/sandbox/pull/8
- Any editable file
- https://github.com/refined-github/refined-github/edit/main/readme.md

*/
