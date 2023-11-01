import {$$} from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

let documentTitle: string | undefined;
let submitting: number | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-checks` disables while it waits
	// `[id^="convert-to-issue-body"]` excludes the hidden pre-filled textareas created when opening the dropdown menu of review comments
	return $$('textarea:not([disabled], [id^="convert-to-issue-body"])').some(textarea =>
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
		document.title = '✏️ Draft - ' + document.title;
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
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
