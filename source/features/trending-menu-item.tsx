import React from 'dom-chef';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<false | void> {
	const exploreLink = await elementReady('.Header-link[href="/explore"]');
	if (!exploreLink) {
		return false;
	}

	exploreLink.before(
		<a href="/trending" className={exploreLink.className} data-hotkey="g t">Trending</a>
	);
}

void features.add({
	id: __filebasename,
	description: 'Adds a `Trending` link to the global navbar and a keyboard shortcut: `g` ` t`',
	screenshot: false,
	shortcuts: {
		'g t': 'Go to Trending'
	}
}, {
	exclude: [
		pageDetect.isGist
	],
	waitForDomReady: false,
	init: onetime(init)
});
