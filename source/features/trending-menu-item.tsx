import React from 'dom-chef';
import features from '../libs/features';
import {isTrending} from '../libs/page-detect';
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

	// Explore link highlights /trending urls by default, remove that behavior
	if (isTrending()) {
		exploreLink.classList.remove('selected');
	}
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
