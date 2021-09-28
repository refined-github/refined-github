import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-build` disables while it waits
	// `[id^="convert-to-issue-body"]` excludes the hidden pre-filled textareas created when opening the dropdown menu of review comments
	return select.all('textarea:not([disabled], [id^="convert-to-issue-body"])').some(textarea =>
		textarea.value !== textarea.textContent // Exclude comments being edited but not yet changed (and empty comment fields)
		&& (
			!select.exists('.btn-primary[disabled]', textarea.form!) // Exclude forms being submitted
			|| select.exists('input[aria-label="Title"]', textarea.form!) // Exclude forms doesn't fill in required title but have draft comments
		),
	);
}

function updateDocumentTitle(): void {
	if (document.visibilityState === 'hidden' && hasDraftComments()) {
		documentTitle = document.title;
		document.title = '(Draft comment) ' + document.title;
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
	}
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
