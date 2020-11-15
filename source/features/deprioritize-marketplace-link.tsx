import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-marketplace-link'); // Mark this as processed
	select.last('.dropdown-divider', dropdown)!.before(
		<div className="dropdown-divider"/>,
		<a className="dropdown-item" href="/marketplace">Marketplace</a>
	);
}

async function init(): Promise<void> {
	(await elementReady('.Header-link[href="/marketplace"]'))
		// The Marketplace link seems to have an additional wrapper that other links don't have https://i.imgur.com/KV9rtSq.png
		?.closest('.border-top, .mr-3')!.remove();

	(await elementReady('[aria-label="View profile and more"]'))
		?.closest('details')!
		.addEventListener('toggle', handleMenuOpening, {once: true});
}

void features.add(__filebasename, {
	exclude: [
		pageDetect.isGist
	],
	awaitDomReady: false,
	init: onetime(init)
});
