import select from 'select-dom';
import onetime from 'onetime';

import features from '.';
import {getUsername} from '../github-helpers';

function init(): false | void {
	const menuItem = select.last(`[aria-label="View profile and more"] ~ details-menu a[href$="/${getUsername()}"]`);
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
	init: onetime(init)
});
