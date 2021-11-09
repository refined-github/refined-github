import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onProfileDropdownLoad from '../github-events/on-profile-dropdown-load';

async function init(): Promise<void> {
	const marketplaceLink = await elementReady('.Header-link[href="/marketplace"]', {waitForChildren: false});
	if (marketplaceLink) { // On GHE it can be disabled #3725
		// The link seems to have an additional wrapper that other links don't have https://i.imgur.com/KV9rtSq.png
		marketplaceLink.closest('.border-top, .mr-3')!.remove();

		await onProfileDropdownLoad();
		select.last('.header-nav-current-user ~ .dropdown-divider')!.before(
			<div className="dropdown-divider"/>,
			<a role="menuitem" className="dropdown-item" href="/marketplace">Marketplace</a>,
		);
	}
}

void features.add(import.meta.url, {
	exclude: [
		pageDetect.isGist,
	],
	awaitDomReady: false,
	init: onetime(init),
});
