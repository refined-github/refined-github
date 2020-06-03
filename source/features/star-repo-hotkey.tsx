import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	// There are two buttons: unstar and star
	for (const button of select.all('.js-social-form > button')) {
		button.dataset.hotkey = 'g s';
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a keyboard shortcut to star/unstar the current repo: `g` `s`.',
	screenshot: false,
	shortcuts: {
		'g s': 'Star and unstar repository'
	}
}, {
	include: [
		pageDetect.isRepo
	],
	init
});
