import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function update(time: HTMLElement): void {
	time.removeAttribute('tense');
	time.setAttribute('prefix', '');
	time.setAttribute('threshold', 'P6M');
}

function init(signal: AbortSignal): void {
	observe('relative-time', update, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main/source

*/
