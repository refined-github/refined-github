import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;
let submitting: number | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-build` disables while it waits
	// `[id^="convert-to-issue-body"]` excludes the hidden pre-filled textareas created when opening the dropdown menu of review comments
	return select.all('textarea:not([disabled], [id^="convert-to-issue-body"])').some(textarea =>
		textarea.value !== textarea.textContent, // Exclude comments being edited but not yet changed (and empty comment fields)
	);
}

function disableOnSubmit(): void {
	clearTimeout(submitting);
	submitting = window.setTimeout(() => {
		submitting = undefined;
	}, 2000);
}

function updateDocumentTitle(): void {
	if (submitting) {
		return;
	}

	if (document.visibilityState === 'hidden' && hasDraftComments()) {
		documentTitle = document.title;
		document.title = '✏️ (draft) ' + document.title;
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
	}
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
	delegate(document, 'form', 'submit', disableOnSubmit, {capture: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
