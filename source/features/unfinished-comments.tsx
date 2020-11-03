import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | undefined;

function hasDraftComments(): boolean {
	return select.all('textarea').some(textarea => textarea.value.length > 0 && textarea.offsetWidth > 0);
}

async function updateDocumentTitle(): Promise<void> {
	if (documentTitle) {
		document.title = documentTitle;
		documentTitle = undefined;
	} else if (document.visibilityState === 'hidden' && hasDraftComments()) {
		documentTitle = document.title;
		document.title = '(Draft comment) ' + document.title;
	}
}

function init(): void {
	document.addEventListener('visibilitychange', updateDocumentTitle);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
