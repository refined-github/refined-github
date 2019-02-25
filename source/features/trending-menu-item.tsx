import React from 'dom-chef';
import features from '../libs/features';
import {isTrending} from '../libs/page-detect';
import {safeElementReady} from '../libs/dom-utils';

async function init(): AsyncFeatureInit {
	const selectedClass = isTrending() ? 'selected' : '';
	const issuesLink = await safeElementReady('.HeaderNavlink[href="/issues"], .header-nav-link[href="/issues"]');
	if (!issuesLink) {
		return false;
	}

	issuesLink.parentElement!.after(
		<li className="header-nav-item">
			<a href="/trending" className={`js-selected-navigation-item HeaderNavlink px-lg-2 py-2 py-lg-0 ${selectedClass}`} data-hotkey="g t">Trending</a>
		</li>
	);

	// Explore link highlights /trending urls by default, remove that behavior
	if (isTrending()) {
		const exploreLink = await safeElementReady('a[href="/explore"]');
		if (exploreLink) {
			exploreLink.classList.remove('selected');
		}
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
