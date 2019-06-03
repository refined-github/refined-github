import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';
import features from '../libs/features';

async function init(): Promise<void> {
	(await elementReady('.Header-link[href="/marketplace"]'))!.remove();

	await domLoaded;

	select.last('.header-nav-current-user ~ .dropdown-divider')!.before(
		<div className="dropdown-divider"></div>,
		<a className="dropdown-item" href="/marketplace">Marketplace</a>
	);
}

features.add({
	id: 'move-marketplace-link-to-profile-dropdown',
	description: 'Move the "Marketplace" link from the black header bar to the profile dropdown',
	exclude: [
		features.isGist
	],
	init
});
