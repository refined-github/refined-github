import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getRepoURL} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void> {
	if (!select.exists('[data-hotkey="t"]')) {
		document.body.append(
			<a
				hidden
				data-hotkey="t"
				data-pjax="true"
				href={`/${getRepoURL()}/find/${await getDefaultBranch()}`}
			/>
		);
	}
}

features.add({
	id: __filebasename,
	description: 'Enables the the File Finder keyboard shortcut (`t`) on Issues and Pull Request pages as well.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoDiscussionList,
		pageDetect.isPR,
		pageDetect.isIssue
	],
	init
});
