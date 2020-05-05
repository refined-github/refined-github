import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

async function init(): Promise<void> {
	const marketPlaceLink = (await elementReady('.Header-link[href="/marketplace"]'));
	if (marketPlaceLink) {
		// The Marketplace link seems to have an additional wrapper that other links don't have https://i.imgur.com/KV9rtSq.png
		marketPlaceLink.closest('.border-top, .mr-3')!.remove();
	}

	await domLoaded;

	select.last('.header-nav-current-user ~ .dropdown-divider')!.before(
		<div className="dropdown-divider"/>,
		<a className="dropdown-item" href="/marketplace">Marketplace</a>
	);
}

features.add({
	id: __filebasename,
	description: 'Moves the "Marketplace" link from the black header bar to the profile dropdown.',
	screenshot: false
}, {
	exclude: [
		pageDetect.isGist
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
