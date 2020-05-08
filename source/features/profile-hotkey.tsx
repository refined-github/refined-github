import select from 'select-dom';

import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init(): false | void {
	const menuItem = select(`a[href="/${getUsername()}"]`);

	if (menuItem) {
		menuItem.dataset.hotkey = 'g m';
	} else {
		return false;
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a keyboard shortcut to visit your own profile: `g` `m`.',
	screenshot: false,
	shortcuts: {
		'g m': 'Go to Profile'
	}
}, {
	repeatOnAjax: false,
	init
});
