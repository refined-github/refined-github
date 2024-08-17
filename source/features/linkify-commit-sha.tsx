import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';

function init(): void {
	const element = $('.sha.user-select-contain:not(a *)');
	if (element) {
		wrap(element, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')}/>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRCommit,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/1429/commits/b533ffa5820d825e1730c62d11acb2edbfb2d7dd

*/
