import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-build` disables while it waits
	return select.all<HTMLTextAreaElement>('textarea:not([disabled])').some(textarea =>
		textarea.value !== textarea.textContent && // Exclude comments being edited but not yet changed (and empty comment fields)
		textarea.offsetWidth > 0 && // Exclude invisible fields
		!textarea.closest('.rgh-is-sending-comment') // Exclude forms being submitted
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

function tagSendingForm({delegateTarget: form}: delegate.Event<Event, HTMLFormElement>): void {
	form.classList.add('rgh-is-sending-comment');
	form.addEventListener('reset', () => {
		form.classList.remove('rgh-is-sending-comment');
	}, {once: true});
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
	delegate(document, 'form', 'submit', tagSendingForm);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
