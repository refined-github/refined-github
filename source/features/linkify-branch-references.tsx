import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {buildRepoURL} from '../github-helpers';

async function init(): Promise<void | false> {
	const element = await elementReady('.branch-name');
	if (!element) {
		return false;
	}

	const branchUrl = buildRepoURL('tree', element.textContent!);
	wrap(element.closest('.branch-name')!, <a href={branchUrl}/>);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isQuickPR
	],
	init
});
