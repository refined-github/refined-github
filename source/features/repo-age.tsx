import * as pageDetect from 'github-url-detection';
import {closestElement} from 'select-dom';
import {mount} from 'svelte';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import GetFirstCommit from './repo-age-first-commit.gql';
import GetRepoAge from './repo-age.gql';
import RepoAge from './repo-age.svelte';

type CommitTarget = {
	oid: string;
	committedDate: string;
	history: {
		totalCount: number;
	};
};

function buildLastCommitsPageUrl(commitSha: string, commitsCount: number): string {
	if (commitsCount <= 2) {
		return buildRepoUrl('commits');
	}

	const offset = commitsCount - 2;
	return buildRepoUrl('commits', `?after=${commitSha}+${offset}`);
}

async function getRepoAge(
	commitSha: string,
	commitsCount: number,
): Promise<[committedDate: string, lastCommitsPageUrl: string]> {
	const {repository} = await api.v4(GetRepoAge, {
		variables: {
			cursor: `${commitSha} ${commitsCount - Math.min(6, commitsCount)}`,
		},
	});

	const {committedDate} = repository.defaultBranchRef.target.history.nodes
		// Filter out any invalid commit dates #3185
		.findLast((commit: CommitTarget) => new Date(commit.committedDate).getFullYear() > 1970);

	const lastCommitsPageUrl = buildLastCommitsPageUrl(commitSha, commitsCount);
	return [committedDate, lastCommitsPageUrl];
}

type RepoDates = {
	createdAt: string;
	firstCommitDate: string;
	lastCommitsPageUrl: string;
};

// The cache name changed because the stored value is now an object
const repoDates = new CachedFunction('repo-dates', {
	async updater(): Promise<RepoDates> {
		const {repository} = await api.v4(GetFirstCommit);

		const {oid: commitSha, history, committedDate} = repository.defaultBranchRef.target as CommitTarget;
		const commitsCount = history.totalCount;
		if (commitsCount === 1) {
			const lastCommitsPageUrl = buildLastCommitsPageUrl(commitSha, commitsCount);
			return {createdAt: repository.createdAt, firstCommitDate: committedDate, lastCommitsPageUrl};
		}

		const [firstCommitDate, lastCommitsPageUrl] = await getRepoAge(commitSha, commitsCount);
		return {createdAt: repository.createdAt, firstCommitDate, lastCommitsPageUrl};
	},
	cacheKey: cacheByRepo,
});

async function addRepoAge(sidebarForksLinkIcon: HTMLElement): Promise<void> {
	const {createdAt, firstCommitDate, lastCommitsPageUrl} = await repoDates.get();
	const container = closestElement('.mt-2', sidebarForksLinkIcon);

	mount(RepoAge, {
		target: container.parentElement!,
		anchor: container.nextElementSibling ?? undefined,
		props: {createdAt, firstCommitDate, lastCommitsPageUrl},
	});
}

async function init(signal: AbortSignal): Promise<void> {
	// Use the observer because React replaces the sidebar’s subtree during hydration, discarding the element we inserted
	observe('[class*="PageLayout-Pane"] .octicon-repo-forked', addRepoAge, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox
https://github.com/refined-github/sandbox/tree/6619
https://github.com/bfred-it/bfred-it.github.io
https://github.com/NextAlone/Nagram

*/
