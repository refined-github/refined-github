import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import addAfterBranchSelector from '../helpers/add-after-branch-selector';
import {getPullRequestsAssociatedWithBranch, stateIcon} from './show-associated-branch-prs-on-fork';

// Taken from https://github.com/fregante/github-issue-link-status/blob/98792f2837352bacbf80664f3edbcec8e579ed17/source/github-issue-link-status.js#L10
const stateColorMap = {
	OPEN: 'text-green color-text-success',
	CLOSED: 'text-red color-text-danger',
	MERGED: 'text-purple color-purple-5',
	DRAFT: '',
};

// TODO remove this after #4196 is fixed
function getCurrentBranch(): string {
	const feedLink = select.last('link[type="application/atom+xml"]')!;
	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}

async function init(): Promise<void | false> {
	const currentBranch = getCurrentBranch();

	if (/^[\da-f]{40}$/.test(currentBranch) || await getDefaultBranch() === currentBranch) {
		return false;
	}

	const getPr = await getPullRequestsAssociatedWithBranch();
	const prInfo = getPr[currentBranch];

	const StateIcon = stateIcon[prInfo.state];
	const link = (
		<a
			data-issue-and-pr-hovercards-enabled
			href={prInfo.url}
			className="btn flex-self-center rgh-list-pr-for-branch"
			data-hovercard-type="pull_request"
			data-hovercard-url={prInfo.url + '/hovercard'}
		>
			<StateIcon className={stateColorMap[prInfo.state]}/>
			<span> #{prInfo.number}</span>
		</a>
	);

	await addAfterBranchSelector(link);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList,
	],
	awaitDomReady: false,
	init,
});
