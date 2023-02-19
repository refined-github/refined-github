import onetime from 'onetime';

import features from '../feature-manager';
import {linkifiedURLClass, shortenLink} from '../github-helpers/dom-formatters';
import observe from '../helpers/selector-observer';

/* This feature is currently so broad that it's not de-inited via signal, it's just run once for all pageloads #5889 */
function init(): void {
	observe(`.comment-body a[href]:not(.${linkifiedURLClass})`, shortenLink);
}

void features.add(import.meta.url, {
	init: onetime(init),
});

/*
## Test URLs

https://github.com/refined-github/sandbox/pull/14
https://github.com/refined-github/refined-github/pull/473
*/
