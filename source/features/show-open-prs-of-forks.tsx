import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import {getForkedRepo, getUsername, getRepo} from '../github-helpers';

function getLinkCopy(count: number): string {
	return pluralize(count, 'one open pull request', 'at least $$ open pull requests');
}

const countPRs = cache.function('prs-on-forked-repo', async (forkedRepo: string): Promise<[prCount: number, singlePrNumber?: number]> => {
	const {search} = await api.v4(`
		search(
			first: 100,
			type: ISSUE,
			query: "is:pr is:open archived:false repo:${forkedRepo} author:${getUsername()!}"
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
	cacheKey: ([forkedRepo]): string => `${forkedRepo}:${getRepo()!.nameWithOwner}`,
});

// eslint-disable-next-line @typescript-eslint/ban-types
async function getPRs(): Promise<[prCount: number, url: string] | []> {
	// Wait for the tab bar to be loaded
	await elementReady('.UnderlineNav-body');
	if (!pageDetect.canUserEditRepo()) {
		return [];
	}

	const forkedRepo = getForkedRepo()!;
	const [count, firstPr] = await countPRs(forkedRepo);
	if (count === 1) {
		return [count, `/${forkedRepo}/pull/${firstPr!}`];
	}

	const url = new URL(`/${forkedRepo}/pulls`, location.origin);
	url.searchParams.set('q', 'is:pr is:open sort:updated-desc author:@me');
	return [count, url.href];
}

async function initHeadHint(): Promise<void | false> {
	const [count, url] = await getPRs();
	if (!count) {
		return false;
	}

	select(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`)!.after(
		// The class is used by `quick-fork-deletion`
		<> with <a href={url} className="rgh-open-prs-of-forks">{getLinkCopy(count)}</a></>,
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
		</p>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	deduplicate: 'has-rgh',
	init: initHeadHint,
}, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	include: [
		pageDetect.isRepoMainSettings,
	],
	deduplicate: 'has-rgh',
	init: initDeleteHint,
});
