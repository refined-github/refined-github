import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getForkedRepo, getLoggedInUser, getRepo} from '../github-helpers/index.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer.js';
import GetPRs from './show-open-prs-of-forks.gql';

const countPrs = new CachedFunction('prs-on-forked-repo', {
	async updater(forkedRepo: string): Promise<{count: number; firstPr?: number}> {
		const {search} = await api.v4(GetPRs, {
			variables: {
				query: `is:pr state:open archived:false repo:${forkedRepo} author:${getLoggedInUser()!}`,
			},
		});

		// Only show PRs originated from the current repo
		const prs = search.nodes.filter((pr: AnyObject) => pr.headRepository.nameWithOwner === getRepo()!.nameWithOwner);

		// If only one is found, pass the PR number so we can link to the PR directly
		if (prs.length === 1) {
			return {count: 1, firstPr: prs[0].number};
		}

		return {count: prs.length};
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: ([forkedRepo]): string => `${forkedRepo}:${getRepo()!.nameWithOwner}`,
});

// eslint-disable-next-line @typescript-eslint/no-restricted-types
async function getPrs(): Promise<[prCount: number, url: string] | []> {
	// Wait for the tab bar to be loaded
	// Maybe replace with https://github.com/refined-github/github-url-detection/issues/85
	await elementReady('.UnderlineNav-body');
	if (!pageDetect.canUserAccessRepoSettings()) {
		return [];
	}

	const forkedRepo = getForkedRepo()!;
	const {count, firstPr} = await countPrs.get(forkedRepo);
	if (count === 1) {
		return [count, `/${forkedRepo}/pull/${firstPr!}`];
	}

	const url = new URL(`/${forkedRepo}/pulls`, location.origin);
	url.searchParams.set('q', 'is:pr state:open author:@me');
	return [count, url.href];
}

async function initHeadHint(signal: AbortSignal): Promise<void | false> {
	const [count, url] = await getPrs();
	if (!count) {
		return false;
	}

	// Use the observer because GitHub randomly updates the header and removes the hint after load
	observe(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`, (repoHeader): void => {
		repoHeader.after(
			' with ',
			<a href={url}>{pluralize(count, 'one open pull request', '$$+ open pull requests')}</a>,
		);
	}, {signal});
}

async function initDeleteHint(): Promise<void | false> {
	const [count, url] = await getPrs();
	if (!count) {
		return false;
	}

	$('#repo-delete-proceed-button-container').before(
		<p className="flash flash-warn">
			It will also close your <a href={url}>{pluralize(count, 'open pull request', '$$+ open pull requests')}</a> in <strong>{getForkedRepo()!}</strong>.
		</p>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	requiresToken: true,
	init: initHeadHint,
}, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	include: [
		pageDetect.isRepoMainSettings,
	],
	requiresToken: true,
	init: initDeleteHint,
});

/*

Test URLs:

1. Visit https://github.com/pulls?q=is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me
2. Find a PR made from a fork
3. In it, open your own fork

*/
