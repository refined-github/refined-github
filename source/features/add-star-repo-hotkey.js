import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('repos', 'g s', 'Star and unstar repository');

	// There are two buttons: unstar and star
	for (const button of select.all('.js-social-form > button')) {
		button.setAttribute('data-hotkey', 'g s');
	}
}
