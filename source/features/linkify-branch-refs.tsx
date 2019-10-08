import React from 'dom-chef';
import elementReady from 'element-ready';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import {wrap} from '../libs/dom-utils';

async function init(): Promise<void> {
	const el = await elementReady('.branch-name');
	if (el) {
		const branchUrl = `/${getRepoURL()}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name')!, <a href={branchUrl}></a>);
	}
}

features.add({
	id: __featureName__,
	description: 'Linkifies branch references in "Quick PR" pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/30208043-fa1ceaec-94bb-11e7-9c32-feabcf7db296.png',
	include: [
		features.isQuickPR
	],
	load: features.onAjaxedPages,
	init
});
