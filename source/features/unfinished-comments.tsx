import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle: string | null = null;

async function updateDocumentTitle(): Promise<void> {
	if (document.visibilityState === 'hidden') {
		if (select.all('textarea').some(textarea => textarea.value.length > 0 && textarea.offsetWidth > 0) {
			documentTitle = document.title;
			document.title = '(Draft comment) ' + document.title;
		}
	} else if (documentTitle) {
		document.title = documentTitle;
		documentTitle = null;
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
