import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {isForkedRepo, isRepoWithAccess} from 'github-page-detection';
import {getForkedRepo, getUsername, pluralize} from '../libs/utils';

function getLinkCopy(count: number): string {
	return pluralize(count, 'one open pull request', '$$ open pull requests');
}

const countPRs = cache.function(async (forkedRepo: string): Promise<[number, number?]> => {
	// Grab the PR count and the first PR's URL
	// This allows to link to the PR directly if only one is found
	const {search} = await api.v4(`
		search(
			first: 1,
			type: ISSUE,
			query: "repo:${forkedRepo} is:pr is:open author:${getUsername()}"
		) {
			issueCount
			nodes {
				... on PullRequest {
					number
				}
			}
		}
	`);

	if (search.issueCount === 1) {
		return [1, search.nodes[0].number];
	}

	return [search.issueCount];
}, {
	maxAge: 1 / 2, // Stale after 12 hours
	staleWhileRevalidate: 2,
	cacheKey: ([forkedRepo]): string => 'prs-on-forked-repo:' + forkedRepo
});

async function getPRs(): Promise<[number, string] | []> {
	await elementReady('.repohead + *'); // Wait for the tab bar to be loaded
	if (!isRepoWithAccess()) {
		return [];
	}

	const forkedRepo = getForkedRepo()!;
	const [count, firstPr] = await countPRs(forkedRepo);
	if (count === 1) {
		return [count, `/${forkedRepo}/pull/${firstPr!}`];
	}

	return [count, `/${forkedRepo}/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+author%3A${getUsername()}`];
}

async function initHeadHint(): Promise<void | false> {
	const [count, url] = await getPRs();
	if (!count) {
		return false;
	}

	select('.fork-flag .text')!.append(
		<> with <a href={url}>{getLinkCopy(count)}</a></>
	);
}

async function initDeleteHint(): Promise<void | false> {
	const [count, url] = await getPRs();
	if (!count) {
		return false;
	}

	select('details-dialog[aria-label*="Delete"] .Box-body p:first-child')!.after(
		<p className="flash flash-warn">
			It will also abandon <a href={url}>your {getLinkCopy(count)}</a> in <strong>{getForkedRepo()!}</strong> and you’ll no longer be able to edit {count === 1 ? 'it' : 'them'}.
		</p>
	);
}

features.add({
	id: __filebasename,
	description: 'In your forked repos, shows number of your open PRs to the original repo.',
	screenshot: 'https://user-images.githubusercontent.com/1922624/76398271-e0648500-637c-11ea-8210-53dda1be9d51.png'
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !isForkedRepo()
	],
	waitForDomReady: false,
	init: initHeadHint
}, {
	include: [
		pageDetect.isRepoSettings
	],
	exclude: [
		() => !isForkedRepo()
	],
	waitForDomReady: false,
	init: initDeleteHint
});
