import React from 'dom-chef';

import features from '../feature-manager.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {pullRequestsAssociatedWithBranch, stateIcon} from './show-associated-branch-prs-on-fork.js';
import {addAfterBranchSelector, isPermalink, isRepoCommitListRoot} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {branchSelectorParent} from '../github-helpers/selectors.js';

// Taken from https://github.com/fregante/github-issue-link-status/blob/98792f2837352bacbf80664f3edbcec8e579ed17/source/github-issue-link-status.js#L10
const stateColorMap = {
	OPEN: 'color-fg-success',
	CLOSED: 'color-fg-danger',
	MERGED: 'color-fg-done',
	DRAFT: '',
};

async function add(branchSelectorParent: HTMLDetailsElement): Promise<void | false> {
	const getPr = await pullRequestsAssociatedWithBranch.get();
	const currentBranch = getCurrentGitRef()!;
	const prInfo = getPr[currentBranch];
	if (!prInfo) {
		return;
	}

	const StateIcon = stateIcon[prInfo.state];

	addAfterBranchSelector(
		branchSelectorParent,
		<a
			data-issue-and-pr-hovercards-enabled
			href={prInfo.url}
			className="btn flex-self-center rgh-list-prs-for-branch"
			data-hovercard-type="pull_request"
			data-hovercard-url={prInfo.url + '/hovercard'}
		>
			<StateIcon className={stateColorMap[prInfo.state]}/>
			<span> #{prInfo.number}</span>
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	observe(branchSelectorParent, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoCommitListRoot,
	],
	exclude: [
		isDefaultBranch,
		isPermalink,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/commits/4679-1
https://github.com/refined-github/sandbox/commits/branch/with/slashes

*/
