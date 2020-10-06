import onetime from 'onetime';
import {observe} from 'selector-observer';
import {applyToLink} from 'shorten-repo-url';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass} from '../github-helpers/dom-formatters';

function init(): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, {
		constructor: HTMLAnchorElement,
		add(link) {
			applyToLink(link, location.href);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Shortens URLs and repo URLs to readable references like "_user/repo/.file@`d71718d`".',
	screenshot: 'https://user-images.githubusercontent.com/1402241/27252232-8fdf8ed0-538b-11e7-8f19-12d317c9cd32.png',
	testOn: ''
}, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults
	],
	init: onetime(init)
});
