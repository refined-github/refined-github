/**
@description Adds a link to the non-PR commit when visiting a PR commit.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/83146190/261164635-b3caa3fa-3bb6-41a5-90d3-4aba84517da6.png
*/

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {wrap} from '../helpers/dom-utils.js';

function init(): void {
	const element = $optional('.sha.user-select-contain:not(a *)');
	if (element) {
		wrap(element, <a href={location.pathname.replace(/pull\/\d+\/commits/, 'commit')} />);
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
