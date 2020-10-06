import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	// Only remove the tab if it's not the current page and if it has 0 checks
	const checksCounter = select('.tabnav-tab[href$="/checks"]:not(.selected) .Counter');

	if (checksCounter?.textContent!.trim() === '0') {
		checksCounter?.parentElement!.remove();
	}
}

void features.add({
	id: __filebasename,
	description: 'Hides the `Checks` tab if it’s empty, unless you’re the owner.',
	screenshot: false,
	testOn: ''
}, {
	include: [
		pageDetect.isPR
	],
	exclude: [
		pageDetect.canUserEditRepo
	],
	init
});
