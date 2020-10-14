import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {getRepoURL} from '../github-helpers';

async function init(): Promise<void | false> {
	const element = await elementReady('.branch-name');
	if (!element) {
		return false;
	}

	const branchUrl = getRepoURL('tree', element.textContent!);
	wrap(element.closest('.branch-name')!, <a href={branchUrl}/>);
}

void features.add({
	id: __filebasename,
	description: 'Linkifies branch references in "Quick PR" pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/30208043-fa1ceaec-94bb-11e7-9c32-feabcf7db296.png'
}, {
	include: [
		pageDetect.isQuickPR
	],
	init
});
