import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): false | void {
	const lastDivider = select.all('.user-nav .dropdown-divider').pop();
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
	exclude: [
		features.isGist
	],
	load: features.onDomReady,
	init
});
