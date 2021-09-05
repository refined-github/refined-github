import onetime from 'onetime';
import {observe} from 'selector-observer';
import {applyToLink} from 'shorten-repo-url';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass} from '../github-helpers/dom-formatters';

function init(): void {
	observe(`a[href]:not(:is(.${linkifiedURLClass}, .octolinker-link))`, {
		constructor: HTMLAnchorElement,
		add(link) {
			applyToLink(link, location.href);
		},
	});
}

void features.add(__filebasename, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});
