import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {buildRepoURL} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';

async function init(): Promise<void> {
	document.body.append(
		<a
			hidden
			data-hotkey="t"
			data-pjax="true"
			href={buildRepoURL('find', await getDefaultBranch())}
		/>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList,
		pageDetect.isPR,
		pageDetect.isIssue
	],
	exclude: [
		() => select.exists('[data-hotkey="t"]'),
		pageDetect.isEmptyRepo
	],
	init
});
