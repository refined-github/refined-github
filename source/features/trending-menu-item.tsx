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
	id: __featureName__,
	description: 'Adds a `Trending` link to the global navbar and a keyboard shortcut: `g` ` t`',
	screenshot: false,
	exclude: [
		features.isGist
	],
	shortcuts: {
		'g t': 'Go to Trending'
	},
	init
});
