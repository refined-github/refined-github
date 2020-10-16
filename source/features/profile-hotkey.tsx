import select from 'select-dom';
import onetime from 'onetime';

import features from '.';

function init(): void {
	select('a[data-ga-click$="text:your profile"]')!.dataset.hotkey = 'g m';
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
