/** @jsx h */
import {h} from 'preact';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import features from '.';

async function init(): Promise<false | void> {
	const exploreLink = await elementReady('.Header-link[href="/explore"]', {waitForChildren: false});
	if (!exploreLink) {
		return false;
	}

	exploreLink.before(
		<a href="/trending" className={exploreLink.className} data-hotkey="g t">Trending</a>
	);
}

void features.add(__filebasename, {
	shortcuts: {
		'g t': 'Go to Trending'
	},
	exclude: [
		pageDetect.isGist
	],
	awaitDomReady: false,
	init: onetime(init)
});
