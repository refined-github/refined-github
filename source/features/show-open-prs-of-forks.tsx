import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from '../libs/api';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getForkedRepo, getUsername} from '../libs/utils';

interface PullRequestData {
	count: number;
	firstUrl: string;
}

function getUserPullRequestsURL(forkedRepo: string, user: string): string {
	return `/${forkedRepo}/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+author%3A${user}`;
}

const getRawOpenPullRequestsData = cache.function(async (forkedRepo: string): Promise<[number, number] | false> => {
	// Grab the PR count and the first PR's URL
	// This allows to link to the PR directly if only one is found
	const {search} = await api.v4(`
		search(type: ISSUE, query: "repo:${forkedRepo} is:pr is:open author:${getUsername()}", first: 1) {
			issueCount
			nodes {
				... on PullRequest {
					number
				}
			}
		}
	`);

	if (search.issueCount === 0) {
		return false;
	}

	return [search.issueCount, search.nodes[0].number];
}, {
	maxAge: 1 / 2, // Stale after 12 hours
	staleWhileRevalidate: 2,
	cacheKey: ([forkedRepo]): string => __featureName__ + ':' + forkedRepo
});

async function getOpenPullRequestsData(forkedRepo: string): Promise<PullRequestData | undefined> {
	const rawOpenPullRequestsData = await getRawOpenPullRequestsData(forkedRepo);

	if (!rawOpenPullRequestsData) {
		return;
	}

	return {
		count: rawOpenPullRequestsData[0],
		firstUrl: `/${forkedRepo}/pull/${rawOpenPullRequestsData[1]}`
	};
}

async function initHeadHint(): Promise<void | false> {
	const forkedRepo = getForkedRepo();

	if (!forkedRepo || !isRepoWithAccess()) {
		return false;
	}

	const pullRequestsData = await getOpenPullRequestsData(forkedRepo);

	if (!pullRequestsData) {
		return;
	}

	const user = getUsername();
	const textContainer = select('.fork-flag .text')!;

	if (pullRequestsData.count === 1) {
		textContainer.append(
			<> with <a href={pullRequestsData.firstUrl}>one open pull request</a></>
		);
	} else {
		const pullRequestsURL = getUserPullRequestsURL(forkedRepo, user);

		textContainer.append(
			<> with <a href={pullRequestsURL}>{pullRequestsData.count} open pull requests</a></>
		);
	}
}

async function initDeleteHint(): Promise<void | false> {
	const forkedRepo = getForkedRepo();

	if (!forkedRepo || !isRepoWithAccess()) {
		return false;
	}

	const pullRequestsData = await getOpenPullRequestsData(forkedRepo);

	if (!pullRequestsData) {
		return;
	}

	const user = getUsername();
	const deleteDialogParagraph = select('details-dialog[aria-label*="Delete"] .Box-body p:first-child');

	if (!deleteDialogParagraph) {
		return;
	}

	const pullRequestsLink = pullRequestsData.count === 1 ?
		<a href={pullRequestsData.firstUrl}>your open pull request</a> :
		<a href={getUserPullRequestsURL(forkedRepo, user)}>your {pullRequestsData.count} open pull requests</a>;

	deleteDialogParagraph.after(
		<p className="flash flash-warn">
			It will also abandon {pullRequestsLink} in <strong>{forkedRepo}</strong> and
			you’ll no longer be able to edit {pullRequestsData.count === 1 ? 'it' : 'them'}.
		</p>
	);
}

features.add({
	id: __featureName__,
	description: 'In your forked repos, shows number of your open PRs to the original repo.',
	screenshot: 'https://user-images.githubusercontent.com/1922624/76398271-e0648500-637c-11ea-8210-53dda1be9d51.png',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init: initHeadHint
});

features.add({
	id: __featureName__,
	description: '',
	screenshot: '',
	include: [
		features.isRepoSettings
	],
	load: features.nowAndOnAjaxedPages,
	init: initDeleteHint
});
