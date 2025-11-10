import {$$} from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

let submitting: ReturnType<typeof setTimeout> | undefined;

const prefix = '✏️ Comment - ';

function isFieldDirty(field: HTMLTextAreaElement): boolean {
	return field.matches('[class*="Textarea__StyledTextarea"]')
		? field.value.length > 0 // React fields update both value and textContent, so default to "filled === dirty"
		: field.value !== field.textContent;
}

function hasDraftComments(): boolean {
	// `[id^="convert-to-issue-body"]` excludes the hidden pre-filled textareas created when opening the dropdown menu of review comments
	return $$('textarea:not([id^="convert-to-issue-body"])').some(f => isFieldDirty(f));
}

function disableOnSubmit(): void {
	clearTimeout(submitting);
	submitting = setTimeout(() => {
		submitting = undefined;
	}, 2000);
}

function updateDocumentTitle(): void {
	if (submitting) {
		return;
	}

	// Ensure it does not pile up
	document.title = document.title.replace(prefix, '');

	if (document.visibilityState === 'hidden' && hasDraftComments()) {
		document.title = prefix + document.title;
	} else {
		document.title = document.title.replace(prefix, '');
	}
}

function init(signal: AbortSignal): void {
	delegate('form', 'submit', disableOnSubmit, {capture: true, signal});
	document.addEventListener('visibilitychange', updateDocumentTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/4

*/
