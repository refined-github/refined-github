import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const marketplaceLink = select('.Header-link[href="/marketplace"]');
	// On GHE it can be disabled #3725
	if (!marketplaceLink) {
		return;
	}

	// The link seems to have an additional wrapper that other links don't have https://i.imgur.com/KV9rtSq.png
	marketplaceLink.closest('.border-top, .mr-3')!.remove();

	const link = <a href="/marketplace">Marketplace</a>;
	const item = <li>{link}</li>;

	if (pageDetect.isDashboard()) {
		link.classList.add('Link--secondary');
	} else {
		item.classList.add('ml-3', 'ml-lg-0');
	}

	select.last('.footer ul')!.append(item);
}

void features.add(import.meta.url, {
	exclude: [
		pageDetect.isGist,
	],
	init,
});
