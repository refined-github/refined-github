import React from 'dom-chef';
import features from '../libs/features';
import select from 'select-dom';
import {getRepoURL} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void> {
	if (!select.exists('[data-hotkey="t"]')) {
    select('#js-repo-pjax-container')?.appendChild(
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
	description: 'Enables file finder on `t` on Issues & Pull Requests tab',
	screenshot: false,
	include: [
		features.isRepoDiscussionList,
		features.isPR,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
