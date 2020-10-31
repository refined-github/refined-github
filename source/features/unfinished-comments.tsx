import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

let documentTitle = document.title;

function init(): void {
	if (document.body.dataset.visibilityListenerAdded) {
		return;
	}

	const textareas = select.all('textarea');

	document.addEventListener('visibilitychange', async () => {
		if (document.visibilityState === 'hidden') {
			if (textareas.some(textarea => (textarea.offsetWidth > 0 || textarea.offsetHeight > 0) && textarea.value.length > 0)) {
				documentTitle = document.title;
				document.title = '(Draft comment) ' + document.title;
			}

			return;
		}

		document.title = documentTitle;
	});
	document.body.dataset.visibilityListenerAdded = String(true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
