import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass, shortenLink} from '../github-helpers/dom-formatters';

function init(): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, {
		constructor: HTMLAnchorElement,
		add: shortenLink,
	});
}

void features.add(import.meta.url, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});
