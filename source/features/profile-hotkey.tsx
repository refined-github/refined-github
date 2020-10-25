import select from 'select-dom';
import onetime from 'onetime';

import features from '.';

function init(): void {
	select('a[data-ga-click$="text:your profile"]')!.dataset.hotkey = 'g m';
}

void features.add(__filebasename, {
	shortcuts: {
		'g m': 'Go to Profile'
	},
	init: onetime(init)
});
