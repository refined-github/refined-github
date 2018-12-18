import select from 'select-dom';
import {getUsername} from '../libs/utils';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
	registerShortcut('site', 'g m', 'Go to Profile');

	const menuItem = select(`#user-links a.dropdown-item[href="/${getUsername()}"]`);
	if (menuItem) {
		menuItem.setAttribute('data-hotkey', 'g m');
	}
}
