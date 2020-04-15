import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {isRepoDiscussionList, isPR, isIssue} from '../libs/page-detect';
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
	id: __featureName__,
	description: 'Enables the the File Finder keyboard shortcut (`t`) on Issues and Pull Request pages as well.',
	screenshot: false
}, {
	include: [
		isRepoDiscussionList,
		isPR,
		isIssue
	],
	init
});
