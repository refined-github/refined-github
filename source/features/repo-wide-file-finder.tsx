import './repo-wide-file-finder.css';
import React from 'dom-chef';
import features from '../libs/features';
import select from 'select-dom';
import {getRepoURL} from '../libs/utils';
import getDefaultBranch from '../libs/get-default-branch';

async function init(): Promise<void> {
	const defaultBranch = await getDefaultBranch();
	const pjaxContainer = select('#js-repo-pjax-container');
	const fileFinderButtonExists = select.exists('[data-hotkey="t"]');
	const hiddenButton: HTMLElement = (
		<a
			hidden
			id="rgh-file-finder-hidden-btn"
			data-hotkey="t"
			data-pjax="true"
			href={`/${getRepoURL()}/find/${defaultBranch}`}
		/>
	);
	if (!fileFinderButtonExists) {
    pjaxContainer?.appendChild(hiddenButton);
	}
}

function deinit(): void {
	const pjaxContainer = select('#js-repo-pjax-container');
	const hiddenButton = select<HTMLAnchorElement>('#rgh-file-finder-hidden-btn');

	if (hiddenButton) {
    pjaxContainer?.removeChild(hiddenButton);
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
	exclude: [
		features.isRepoRoot,
		features.isRepoTree,
		features.isSingleFile,
		features.isFileFinder
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
