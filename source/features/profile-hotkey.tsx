import onetime from 'onetime';
import {isEnterprise} from 'github-url-detection';

import features from '../feature-manager.js';
import {getUsername} from '../github-helpers/index.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function init(signal: AbortSignal): void {
	// This patterns also works on gist.github.com
	const origin = isEnterprise() ? location.origin : 'https://github.com';
	const profileLink = new URL(getUsername()!, origin);
	registerHotkey('g m', profileLink.href, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'g m': 'Go to Profile',
	},
	init: onetime(init),
});

/*

Test URLs:

1. Visit any page

*/
