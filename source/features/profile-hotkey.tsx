import React from 'jsx-dom';
import onetime from 'onetime';
import {isEnterprise} from 'github-url-detection';

import features from '.';
import {getUsername} from '../github-helpers';

function init(): void {
	const profileLink = (isEnterprise() ? location.origin : 'https://github.com') + '/' + getUsername();
	document.body.append(<a hidden data-hotkey="g m" href={profileLink}/>);
}

void features.add(__filebasename, {
	shortcuts: {
		'g m': 'Go to Profile'
	},
	awaitDomReady: false,
	init: onetime(init)
});
