import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../libs/dom-utils';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

async function init(): Promise<void> {
	const element = await elementReady('.branch-name');
	if (element) {
		const branchUrl = `/${getRepoURL()}/tree/${element.textContent!}`;
		wrap(element.closest('.branch-name')!, <a href={branchUrl}/>);
	}
}

features.add({
	id: __filebasename,
	description: 'Linkifies branch references in "Quick PR" pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/30208043-fa1ceaec-94bb-11e7-9c32-feabcf7db296.png'
}, {
	include: [
		pageDetect.isQuickPR
	],
	init
});
