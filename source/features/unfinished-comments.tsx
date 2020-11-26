import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-build` disables while it waits
	return select.all<HTMLTextAreaElement>('textarea:not([disabled])').some(textarea =>
		textarea.value !== textarea.textContent && // Exclude comments being edited but not yet changed (and empty comment fields)
		(textarea.offsetWidth > 0 || select('.js-preview-body', textarea.form!)!.textContent !== 'Nothing to preview') && // Exclude invisible fields that aren't being previewed
		!select.exists('.btn-primary[disabled]', textarea.form!) // Exclude forms being submitted
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
		pageDetect.hasRichTextEditor
	],
	init
});
