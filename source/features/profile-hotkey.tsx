import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';

import features from '.';

function init(): void {
	// This exists on all pages even gists
	const {origin} = new URL(select('.js-notification-shelf-include-fragment')!.dataset.baseSrc!);
	document.body.append(<a className="d-none" data-hotkey="g m" href={origin + '/profile'}/>);
}

void features.add(__filebasename, {
	shortcuts: {
		'g m': 'Go to Profile'
	},
	init: onetime(init)
});
