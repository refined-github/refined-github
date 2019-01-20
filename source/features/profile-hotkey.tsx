import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	const menuItem = select(`#user-links a.dropdown-item[href="/${getUsername()}"]`);

	if (menuItem) {
		menuItem.setAttribute('data-hotkey', 'g m');
	} else {
		return false;
	}
}

features.add({
	id: 'profile-hotkey',
	load: features.onDomReady,
	shortcuts: {
		'g m': 'Go to Profile'
	},
	init
});
