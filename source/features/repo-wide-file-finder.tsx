import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers.js';

async function init(): Promise<void> {
	document.body.append(
		<a
			hidden
			data-hotkey="t"
			data-pjax="#js-repo-pjax-container"
			href={buildRepoURL('find', getCurrentCommittish() ?? await getDefaultBranch())}
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
	init,
});
