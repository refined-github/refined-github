import React from 'dom-chef';
import elementReady from 'element-ready';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import {wrap} from '../libs/dom-utils';

async function init(): Promise<void> {
	const el = await elementReady('.branch-name');
	if (el) {
		const {ownerName, repoName} = getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name')!, <a href={branchUrl}></a>);
	}
}

features.add({
	id: __featureName__,
	description: 'Click on branch references in pull requests',
	include: [
		features.isQuickPR
	],
	load: features.onAjaxedPages,
	init
});
