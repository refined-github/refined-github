import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	const menuItem = select(`#user-links a.dropdown-item[href="/${getUsername()}"]`);

	if (menuItem) {
		menuItem.setAttribute('data-hotkey', 'g m');
	}
}

