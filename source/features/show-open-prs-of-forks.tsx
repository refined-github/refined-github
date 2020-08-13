import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import {getForkedRepo, getUsername, getRepoURL} from '../github-helpers';

function getLinkCopy(count: number): string {
	return pluralize(count, 'one open pull request', '$$ open pull requests');
}

const countPRs = cache.function(async (forkedRepo: string): Promise<[number, number?]> => {
	const {search} = await api.v4(`
		search(
			first: 100,
			type: ISSUE,
			query: "repo:${forkedRepo} is:pr is:open author:${getUsername()}"
		) {
			nodes {
				... on PullRequest {
					number
					headRepository {
						nameWithOwner
					}
				}
			}
		}
	`);

	// Only show PRs originated from the current repo
	const prs = search.nodes.filter((pr: AnyObject) => pr.headRepository.nameWithOwner.toLowerCase() === getRepoURL());

	// If only one is found, pass the PR number so we can link to the PR directly
	if (prs.length === 1) {
		return [1, prs[0].number];
	}

	return [prs.length];
}, {
	maxAge: 1 / 2, // Stale after 12 hours
	staleWhileRevalidate: 2,
	cacheKey: ([forkedRepo]): string => 'prs-on-forked-repo:' + forkedRepo + ':' + getRepoURL()
});

async function getPRs(): Promise<[number, string] | []> {
	// Wait for the tab bar to be loaded
	await elementReady([
		'.pagehead + *', // Pre "Repository refresh" layout
		'.UnderlineNav-body + *'
	].join());
	if (!pageDetect.canUserEditRepo()) {
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

	select<HTMLAnchorElement>(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`)!.after(
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

void features.add({
	id: __filebasename,
	description: 'In your forked repos, shows number of your open PRs to the original repo.',
	screenshot: 'https://user-images.githubusercontent.com/1922624/76398271-e0648500-637c-11ea-8210-53dda1be9d51.png'
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	waitForDomReady: false,
	init: initHeadHint
}, {
	include: [
		pageDetect.isRepoMainSettings
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	waitForDomReady: false,
	init: initDeleteHint
});
