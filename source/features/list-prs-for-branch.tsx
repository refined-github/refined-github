import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCurrentCommittish} from '../github-helpers';
import {getPullRequestsAssociatedWithBranch, stateIcon} from './show-associated-branch-prs-on-fork';
import observe from '../helpers/selector-observer';

// Taken from https://github.com/fregante/github-issue-link-status/blob/98792f2837352bacbf80664f3edbcec8e579ed17/source/github-issue-link-status.js#L10
const stateColorMap = {
	OPEN: 'color-fg-success',
	CLOSED: 'color-fg-danger',
	MERGED: 'color-fg-done',
	DRAFT: '',
};

async function init(signal: AbortSignal): Promise<void | false> {
	const currentBranch = getCurrentCommittish();
	if (!currentBranch || /^[\da-f]{40}$/.test(currentBranch) || await getDefaultBranch() === currentBranch) {
		return false;
	}

	const getPr = await getPullRequestsAssociatedWithBranch();
	const prInfo = getPr[currentBranch];
	if (!prInfo) {
		return;
	}

	observe([
		'#branch-select-menu',
		'[data-testid="anchor-button"]',
	], branchSelector => {
		const StateIcon = stateIcon[prInfo.state];
		const container = branchSelector.closest('.position-relative')!;
		container.classList.add('d-flex');
		container.append(
			<a
				href={prInfo.url}
				className="btn flex-self-center rgh-list-prs-for-branch"
				data-hovercard-type="pull_request"
				data-hovercard-url={prInfo.url + '/hovercard'}
			>
				<StateIcon className={stateColorMap[prInfo.state]}/>
				<span> #{prInfo.number}</span>
			</a>,
		);
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
