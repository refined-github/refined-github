import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	// There are two buttons: unstar and star
	for (const button of select.all('.js-social-form > button')) {
		button.dataset.hotkey = 'g s';
	}
}

features.add({
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
