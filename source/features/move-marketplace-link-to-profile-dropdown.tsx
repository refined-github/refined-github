import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): false | void {
	const lastDivider = select.last('.user-nav .dropdown-divider');
	if (!lastDivider) {
		return false;
	}

	lastDivider.before(
		<div className="dropdown-divider"></div>,
		<a className="dropdown-item" href="/marketplace">Marketplace</a>
	);
}

features.add({
	id: 'move-marketplace-link-to-profile-dropdown',
	description: 'Move the "Marketplace" link to the profile dropdown',
	exclude: [
		features.isGist
	],
	load: features.onDomReady,
	init
});
