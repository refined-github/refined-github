import select from 'select-dom';
import features, {FeatureInit} from '../libs/features';
import {getUsername} from '../libs/utils';

function init(): FeatureInit {
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
