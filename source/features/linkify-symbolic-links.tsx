import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';

function init(): void {
	if ($optional('.file-mode')?.textContent === 'symbolic link') {
		const line = $('.js-file-line');
		wrap(line.firstChild!, <a href={line.textContent} data-turbo-frame='repo-content-turbo-frame' />);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true, // Small page
	init,
});

/*

Test URLs:

https://github.com/wmluke/angular-flash/blob/0.1.14/app/components

*/
