import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepoURL} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';

async function init(): Promise<void> {
	document.body.append(
		<a
			hidden
			data-hotkey="t"
			data-pjax="true"
			href={getRepoURL(`find/${await getDefaultBranch()}`)}
		/>
	);
}

void features.add({
	id: __filebasename,
	description: 'Enables the File Finder keyboard shortcut (`t`) on Issues and Pull Request pages as well.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoConversationList,
		pageDetect.isPR,
		pageDetect.isIssue
	],
	exclude: [
		() => select.exists('[data-hotkey="t"]')
	],
	init
});
