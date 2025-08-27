import {isEnterprise} from 'github-url-detection';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function initOnce(): void {
	// This patterns also works on gist.github.com
	const origin = isEnterprise() ? location.origin : 'https://github.com';
	const profileLink = new URL(getLoggedInUser()!, origin);
	registerHotkey('g m', profileLink.href);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g m': 'Go to Profile',
	},
	init: onetime(initOnce),
});

/*

Test URLs:

1. Visit any page

*/
