import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import looseParseInt from '../helpers/loose-parse-int';
import {getSingleButton} from './list-prs-for-file';
import {buildRepoURL, getRepo} from '../github-helpers';
import {addAfterBranchSelector} from './latest-tag-button';

function currentBranch(): string {
	const feedLink = select.last('link[type="application/atom+xml"]')!;
	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}

const getPrNumber = cache.function(async (branch: string): Promise<string | undefined> => {
	const prNumber = await fetchDom(
		buildRepoURL('branch_commits', encodeURIComponent(branch)),
		'.pull-request a:not([title^="Merged Pull Request:"])'
	);

	return prNumber?.textContent!;
}, {
	maxAge: {hours: 2},
	staleWhileRevalidate: {days: 9},
	cacheKey: ([branch]) => `associated-branch:${getRepo()!.nameWithOwner}:${branch}`
});

async function init(): Promise<void| false> {
	const prNumber = await getPrNumber(currentBranch());

	if (!prNumber) {
		return false;
	}

	const link = getSingleButton(looseParseInt(prNumber));
	link.classList.add('tooltipped', 'tooltipped-ne');
	link.classList.remove('btn-sm');
	link.setAttribute('aria-label', `This branch is associated with pr ${prNumber}`);
	await addAfterBranchSelector(link);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList
	],
	awaitDomReady: false,
	init
});
