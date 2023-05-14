import React from 'dom-chef';
import onetime from 'onetime';
import {isEnterprise} from 'github-url-detection';

import features from '../feature-manager.js';
import {getUsername} from '../github-helpers/index.js';

function init(): void {
	const profileLink = (isEnterprise() ? location.origin : 'https://github.com') + '/' + getUsername()!;
	document.body.append(<a hidden data-hotkey="g m" href={profileLink}/>);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g m': 'Go to Profile',
	},
	init: onetime(init),
});
