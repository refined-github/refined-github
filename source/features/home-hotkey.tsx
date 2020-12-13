import React from 'dom-chef';
import onetime from 'onetime';
import {isEnterprise} from 'github-url-detection';

import features from '.';

function init(): void {
	const homepageLink = (isEnterprise() ? location.origin : 'https://github.com');
	document.body.append(<a hidden data-hotkey="g h" href={homepageLink}/>);
}

void features.add(__filebasename, {
	shortcuts: {
		'g h': 'Go to home page'
	},
	awaitDomReady: false,
	init: onetime(init)
});
