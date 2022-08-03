import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass, shortenLink} from '../github-helpers/dom-formatters';
import observe from '../helpers/selector-observer';

function init(signal: AbortSignal): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, shortenLink, {signal});
}

void features.add(import.meta.url, {
	exclude: [
		// Due to GitHub’s bug: #2828
		pageDetect.isGlobalSearchResults,
	],
	init: onetime(init),
});

/*

## Test URLs

https://github.com/refined-github/sandbox/pull/14

*/
