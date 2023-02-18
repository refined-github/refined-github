import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

async function init(): Promise<void> {
	document.body.append(
		<a
			hidden
			data-hotkey="t"
			data-turbo-frame="repo-content-turbo-frame"
			href={buildRepoURL('tree', getCurrentCommittish() ?? await getDefaultBranch()) + '?search=1'}
		/>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		() => select.exists('[data-hotkey="t"]'),
		pageDetect.isEmptyRepo,
		pageDetect.isPRFiles,
		pageDetect.isFileFinder,
	],
	awaitDomReady: false,
	init,
});
