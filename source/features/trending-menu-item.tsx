import React from 'dom-chef';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';

async function init() {
	const exploreLink = await safeElementReady('.HeaderNavlink[href="/explore"]');
	if (!exploreLink) {
		return false;
	}

	exploreLink.parentElement.before(
		<li>
			<a href="/trending" className={exploreLink.className} data-hotkey="g t">Trending</a>
		</li>
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
