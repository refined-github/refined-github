import React from 'dom-chef';
import elementReady from 'element-ready';
import features from '../libs/features';

async function init(): Promise<false | void> {
	const exploreLink = await elementReady('.Header-link[href="/explore"]');
	if (!exploreLink) {
		return false;
	}

	exploreLink.before(
		<a href="/trending" className={exploreLink.className} data-hotkey="g t">Trending</a>
	);
}

features.add({
	id: 'trending-menu-item',
	description: 'Access trending repositories using the "Trending" link in the global navigation bar or by pressing `g` ` t`',
	exclude: [
		features.isGist
	],
	shortcuts: {
		'g t': 'Go to Trending'
	},
	init
});
