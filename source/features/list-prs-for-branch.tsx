import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {getCurrentCommittish} from '../github-helpers/index.js';
import addAfterBranchSelector from '../helpers/add-after-branch-selector.js';
import {getPullRequestsAssociatedWithBranch, stateIcon} from './show-associated-branch-prs-on-fork.js';

// Taken from https://github.com/fregante/github-issue-link-status/blob/98792f2837352bacbf80664f3edbcec8e579ed17/source/github-issue-link-status.js#L10
const stateColorMap = {
	OPEN: 'color-fg-success',
	CLOSED: 'color-fg-danger',
	MERGED: 'color-fg-done',
	DRAFT: '',
};

async function init(): Promise<void | false> {
	const currentBranch = getCurrentCommittish();
	if (!currentBranch || /^[\da-f]{40}$/.test(currentBranch) || await getDefaultBranch() === currentBranch) {
		return false;
	}

	const getPr = await getPullRequestsAssociatedWithBranch();
	const prInfo = getPr[currentBranch];
	if (!prInfo) {
		return;
	}

	const StateIcon = stateIcon[prInfo.state];
	const link = (
		<a
			data-issue-and-pr-hovercards-enabled
			href={prInfo.url}
			className="btn flex-self-center rgh-list-prs-for-branch"
			data-hovercard-type="pull_request"
			data-hovercard-url={prInfo.url + '/hovercard'}
		>
			<StateIcon className={stateColorMap[prInfo.state]}/>
			<span> #{prInfo.number}</span>
		</a>
	);

	await addAfterBranchSelector(link);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
