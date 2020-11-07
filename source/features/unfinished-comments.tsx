import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	return select.all('textarea').some(textarea => textarea.value.length > 0 && textarea.offsetWidth > 0);
}

function updateDocumentTitle(): void {
	if (document.visibilityState === 'hidden' && hasDraftComments() && !documentTitle) {
		documentTitle = document.title;
		document.title = '(Draft comment) ' + document.title;
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
	}
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
	delegate(document.body, 'form', 'submit', updateDocumentTitle);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
