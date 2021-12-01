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
	const footers = [elementReady('.footer[role="contentinfo"] ul:last-of-type')]; // Native

	if (pageDetect.isDashboard()) {
		link.classList.add('Link--secondary');
		footers.push(elementReady('[aria-label="Explore"] .footer ul:last-of-type')); // Added by `infinite-scroll`
	} else {
		item.classList.add('ml-3', 'ml-lg-0');
	}

	for await (const footer of footers) {
		footer?.append(item.cloneNode(true));
	}
}

void features.add(import.meta.url, {
	exclude: [
		pageDetect.isGist,
	],
	awaitDomReady: false,
	init,
});
