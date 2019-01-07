import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';
import {registerShortcut} from './improve-shortcut-help';

function init() {
	const menuItem = select(`#user-links a.dropdown-item[href="/${getUsername()}"]`);

	if (menuItem) {
		menuItem.setAttribute('data-hotkey', 'g m');
		registerShortcut('site', 'g m', 'Go to Profile');
	} else {
		return false;
	}
}

features.add({
	id: 'add-profile-hotkey',
	load: features.domLoaded,
	init
});
