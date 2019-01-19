import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const lastDivider = select.all('.user-nav .dropdown-divider').pop();
	if (!lastDivider) {
		return false;
	}

	lastDivider.before(
		<div class="dropdown-divider"></div>,
		<a class="dropdown-item" href="/marketplace">Marketplace</a>
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
