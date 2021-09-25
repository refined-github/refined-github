import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {buildRepoURL} from '../github-helpers';

async function init(): Promise<void | false> {
	const element = await elementReady(pageDetect.isQuickPR() ? '.branch-name' : '.commit-form .branch-name');
	if (!element) {
		return false;
	}

	const branchUrl = buildRepoURL('tree', element.textContent!);
	element.replaceWith(
		<span className="commit-ref">
			<a className="no-underline " href={branchUrl} data-pjax="#repo-content-pjax-container">
				{element.textContent}
			</a>
		</span>,
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isQuickPR,
		pageDetect.isEditingFile,
	],
	init,
});
