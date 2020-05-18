import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void> {
	document.body.append(
		<a
			hidden
			data-hotkey="t"
			data-pjax="true"
			href={`/${getRepoURL()}/find/${await getDefaultBranch()}`}
		/>
	);
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
	exclude: [
		() => select.exists('[data-hotkey="t"]')
	],
	init
});
