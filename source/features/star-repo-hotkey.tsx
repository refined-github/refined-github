import select from 'select-dom';
import features from '../libs/features';
import {registerShortcut} from './improve-shortcut-help';

function init() {
	registerShortcut('repos', 'g s', 'Star and unstar repository');

	// There are two buttons: unstar and star
	for (const button of select.all('.js-social-form > button')) {
		button.setAttribute('data-hotkey', 'g s');
	}
}

features.add({
	id: 'star-repo-hotkey',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
