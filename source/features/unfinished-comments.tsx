import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	// `[disabled]` excludes the PR description field that `wait-for-build` disables while it waits
	return select.all('textarea:not([disabled])').some(textarea => textarea.value.length > 0 && textarea.offsetWidth > 0 && !textarea.closest('.rgh-is-sending-comment'));
}

function updateDocumentTitle(): void {
	if (document.visibilityState === 'hidden' && hasDraftComments()) {
		documentTitle = document.title;
		document.title = '(Draft comment) ' + document.title;
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
	}

	select('.rgh-is-sending-comment')?.classList.remove('rgh-is-sending-comment');
}

function tagSendingForm({delegateTarget}: delegate.Event<Event, HTMLElement>): void {
	delegateTarget.classList.add('rgh-is-sending-comment');
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
	delegate(document.body, 'form', 'submit', tagSendingForm);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
