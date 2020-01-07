import './default-branch-button.css';
import React from 'dom-chef';
import select from 'select-dom';
import chevronLeftIcon from 'octicon/chevron-left.svg';
import features from '../libs/features';
import {isRepoRoot} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';
import {getRepoURL, getCurrentBranch, replaceBranch} from '../libs/utils';
import {groupButtons} from '../libs/group-buttons';

async function getDefaultBranchLink(): Promise<HTMLElement | undefined> {
	const defaultBranch = await getDefaultBranch();
	const currentBranch = getCurrentBranch();

	// Don't show the button if we’re already on the default branch
	if (defaultBranch === currentBranch) {
		return;
	}

	let url;
	if (isRepoRoot()) {
		url = `/${getRepoURL()}`;
	} else {
		url = replaceBranch(currentBranch, defaultBranch);
	}

	return (
		<a
			className="btn btn-sm tooltipped tooltipped-ne"
			href={url}
			aria-label="See this view on the default branch">
			{chevronLeftIcon()}
		</a>
	);
}

async function init(): Promise<false | void> {
	const defaultLink = await getDefaultBranchLink();
	if (defaultLink) {
		select('#branch-select-menu')!.before(defaultLink);
		groupButtons([defaultLink, defaultLink.nextElementSibling!]);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds link the default branch on directory listings and files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/71886648-2891dc00-316f-11ea-98d8-c5bf6c24d85c.png',
	include: [
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
