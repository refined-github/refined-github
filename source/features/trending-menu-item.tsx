import React from 'dom-chef';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';

async function init(): Promise<false | void> {
	const exploreLink = await safeElementReady('.Header-link[href="/explore"]');
	if (!exploreLink) {
		return false;
	}

	exploreLink.before(
		<a href="/trending" className={exploreLink.className} data-hotkey="g t">Trending</a>
	);
}

features.add({
	id: 'trending-menu-item',
	exclude: [
		features.isGist
	],
	shortcuts: {
		'g t': 'Go to Trending'
	},
	init
});
