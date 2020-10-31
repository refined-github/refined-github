import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle = '';

async function updateDocumentTitle(): Promise<void> {
	if (document.visibilityState === 'hidden') {
		if (select.all('textarea').some(textarea => textarea.value.length > 0 && (textarea.offsetWidth > 0 || textarea.offsetHeight > 0))) {
			console.log('changing title');
			documentTitle = document.title;
			document.title = '(Draft comment) ' + document.title;
		}
	} else {
		document.title = documentTitle;
	}
}

function init(): void {
	documentTitle = document.title;
	document.addEventListener('visibilitychange', updateDocumentTitle);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
