import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getSingleButton} from './list-prs-for-file';
import {addAfterBranchSelector} from './latest-tag-button';
import {getPullRequestsAssociatedWithBranch} from './show-associated-branch-prs-on-fork';

function currentBranch(): string {
	const feedLink = select.last('link[type="application/atom+xml"]')!;
	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}

async function init(): Promise<void| false> {
	const getPr = await getPullRequestsAssociatedWithBranch();
	const prNumber = getPr[currentBranch()]?.number;
	if (!prNumber) {
		return false;
	}

	const link = getSingleButton(prNumber);
	link.classList.add('tooltipped', 'tooltipped-ne');
	link.classList.remove('btn-sm');
	link.setAttribute('aria-label', `This branch is associated with pr #${prNumber}`);
	await addAfterBranchSelector(link);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList
	],
	awaitDomReady: false,
	init
});
