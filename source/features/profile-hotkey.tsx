import select from 'select-dom';

import features from '.';
import {getUsername} from '../github-helpers';

function init(): false | void {
	const menuItem = select(`a[href="/${getUsername()}"]`);
	if (!menuItem) {
		return false;
	}

	menuItem.dataset.hotkey = 'g m';
}

void features.add({
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
