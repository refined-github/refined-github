import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {linkifiedURLClass, shortenLink} from '../github-helpers/dom-formatters';
import observe from '../helpers/selector-observer';

/* This feature is currently so broad that it's not de-inited via signal, it's just run once for all pageloads #5889 */
function init(): void {
	observe(`a[href]:not(.${linkifiedURLClass})`, shortenLink);
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
