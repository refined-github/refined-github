import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('repos', 'g s', 'Star and unstar repository');
	const starButtons = select.all('.starred.js-social-form > button, .unstarred.js-social-form > button');

	const addHotkeyToStarButton = () => {
		starButtons[0].removeAttribute('data-hotkey');
		starButtons[1].setAttribute('data-hotkey', 'g s');
	};
	
	const addHotkeyToUnstarButton = () => {
		starButtons[0].setAttribute('data-hotkey', 'g s');
		starButtons[1].removeAttribute('data-hotkey');
	};

	if (!select.exists('.js-social-container.starring-container.on')) {
		addHotkeyToStarButton();
	} else {
		addHotkeyToUnstarButton();
	}

	starButtons[0].addEventListener('click', addHotkeyToStarButton);
	starButtons[1].addEventListener('click', addHotkeyToUnstarButton);
}
