import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const marketplaceLink = await elementReady('.Header-link[href="/marketplace"]', {waitForChildren: false});
	// On GHE it can be disabled #3725
	if (!marketplaceLink) {
		return;
	}

	marketplaceLink.remove();

	const link = <a href="/marketplace">Marketplace</a>;
	const item = <li>{link}</li>;

	if (pageDetect.isDashboard()) {
		link.classList.add('Link--secondary');
	} else {
		item.classList.add('ml-3', 'ml-lg-0');
	}

	(await elementReady('.footer ul:last-of-type'))!.append(item);
}

void features.add(import.meta.url, {
	exclude: [
		pageDetect.isGist,
	],
	awaitDomReady: false,
	init,
});
