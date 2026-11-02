import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import RepoIcon from 'octicons-plain-react/Repo';
import {closestElement} from 'select-dom';
import twas from 'twas';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import {randomArrayItem} from '../helpers/math.js';
import observe from '../helpers/selector-observer.js';
import GetFirstCommit from './repo-age-first-commit.gql';
import GetRepoAge from './repo-age.gql';

type CommitTarget = {
	oid: string;
	committedDate: string;
	history: {
		totalCount: number;
	};
};

const fresh = [
	'Freshly baked',
	'Freshly brewed',
	'Newly minted',
	'Hot off the presses',
	'Straight out of the oven',
	'Still hot',
	'Smells fresh',
	'Just a baby',
	'It’s my birthday',
	'Brand spanking new',
	'It’s a new world ✨',
	'Certified Fresh Repo™',
	'So it begins, the great battle of our time',
];

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
	// Construct class only when it's needed, as it is relatively expensive
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const {createdAt, firstCommitDate, lastCommitsPageUrl} = await repoDates.get();
	const birthday = new Date(createdAt);
	const firstCommitBirthday = new Date(firstCommitDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(birthday.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ', 2);

	// About a day old or less ?
	const age = Date.now() - birthday.getTime() < 10e7
		? randomArrayItem(fresh)
		: <>
			<strong>{value}</strong> {unit} old
		</>;

	// The creation date is trustworthy, but the history may have been imported, so the first commit can be older. Newer commits are ignored
	const firstCommitIsOlder = firstCommitBirthday.getFullYear() < birthday.getFullYear();

	closestElement('.mt-2', sidebarForksLinkIcon).after(
		<h3 className="sr-only">Repository age</h3>,
		<div className="mt-2 tmp-mt-2">
			<a href={lastCommitsPageUrl} className="Link--muted" title={`Created on ${dateFormatter.format(birthday)}`}>
				<RepoIcon className="mr-2 tmp-mr-2" />
				{age}
			</a>
			{firstCommitIsOlder && (
				<>
					{' '}
					<a
						href={lastCommitsPageUrl}
						className="Link--muted"
						title={`First commit dated ${dateFormatter.format(firstCommitBirthday)}`}
					>
						(or {firstCommitBirthday.getFullYear()}?)
					</a>
				</>
			)}
		</div>,
	);
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
