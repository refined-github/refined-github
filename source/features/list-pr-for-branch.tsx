import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitMergeIcon, GitPullRequestIcon} from '@primer/octicons-react';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {addAfterBranchSelector} from './latest-tag-button';
import {getPullRequestsAssociatedWithBranch} from './show-associated-branch-prs-on-fork';

function getCurrentBranch(): string {
	const feedLink = select.last('link[type="application/atom+xml"]')!;
	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}

const stateColorMap = {
	OPEN: 'text-green color-text-success',
	CLOSED: 'text-red color-text-danger',
	MERGED: 'text-purple color-purple-5',
	DRAFT: ''
};
async function init(): Promise<void | false> {
	const currentBranch = getCurrentBranch();
	const defaultBranch = await getDefaultBranch();

	if (defaultBranch === currentBranch || /^[\da-f]{40}$/.test(currentBranch)) {
		return false;
	}

	const getPr = await getPullRequestsAssociatedWithBranch();
	const prInfo = getPr[currentBranch];
	if (!prInfo) {
		return false;
	}

	const StateIcon = prInfo.state === 'MERGED' ? GitMergeIcon : GitPullRequestIcon;
	const link = (
		<a
			data-issue-and-pr-hovercards-enabled
			aria-label={`This branch is associated with pr #${prInfo.number}`}
			href={prInfo.url}
			className="btn btn-outline flex-self-center rgh-list-pr-for-branch"
			data-hovercard-type="pull_request"
			data-hovercard-url={prInfo.url + '/hovercard'}
		>
			<StateIcon className={stateColorMap[prInfo.state]}/> #{prInfo.number}
		</a>
	);

	await addAfterBranchSelector(link);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList
	],
	awaitDomReady: false,
	init
});
