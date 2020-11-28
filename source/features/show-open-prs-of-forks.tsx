import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import {getForkedRepo, getUsername, getRepo} from '../github-helpers';

function getLinkCopy(count: number): string {
	return pluralize(count, 'one open pull request', '$$ open pull requests');
}

const countPRs = cache.function(async (forkedRepo: string): Promise<[prCount: number, singlePrNumber?: number]> => {
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
	const prs = search.nodes.filter((pr: AnyObject) => pr.headRepository.nameWithOwner === getRepo()!.nameWithOwner);

	// If only one is found, pass the PR number so we can link to the PR directly
	if (prs.length === 1) {
		return [1, prs[0].number];
	}

	return [prs.length];
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: ([forkedRepo]): string => 'prs-on-forked-repo:' + forkedRepo + ':' + getRepo()!.nameWithOwner
});

// eslint-disable-next-line @typescript-eslint/ban-types
async function getPRs(): Promise<[prCount: number, url: string] | []> {
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

	select(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`)!.after(
		// The class is used by `quick-fork-deletion`
		<> with <a href={url} className="rgh-open-prs-of-forks">{getLinkCopy(count)}</a></>
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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	awaitDomReady: false,
	init: initHeadHint
}, {
	include: [
		pageDetect.isRepoMainSettings
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	awaitDomReady: false,
	init: initDeleteHint
});
