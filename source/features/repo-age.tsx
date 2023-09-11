import twas from 'twas';
import {CachedFunction} from 'webext-storage-cache';
import React from 'dom-chef';
import {RepoIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import GetRepoAge from './repo-age.gql';
import GetFirstCommit from './repo-age-first-commit.gql';

type CommitTarget = {
	oid: string;
	committedDate: string;
	resourcePath: string;
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

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
});

async function getRepoAge(commitSha: string, commitsCount: number): Promise<[committedDate: string, resourcePath: string]> {
	const {repository} = await api.v4(GetRepoAge, {
		variables: {
			cursor: `${commitSha} ${commitsCount - Math.min(6, commitsCount)}`,
		},
	});

	const {committedDate, resourcePath} = repository.defaultBranchRef.target.history.nodes
		.reverse()
		// Filter out any invalid commit dates #3185
		.find((commit: CommitTarget) => new Date(commit.committedDate).getFullYear() > 1970);

	return [committedDate, resourcePath];
}

const firstCommit = new CachedFunction('first-commit', {
	async updater(): Promise<[committedDate: string, resourcePath: string]> {
		const {repository} = await api.v4(GetFirstCommit);

		const {oid: commitSha, history, committedDate, resourcePath} = repository.defaultBranchRef.target as CommitTarget;
		const commitsCount = history.totalCount;
		if (commitsCount === 1) {
			return [committedDate, resourcePath];
		}

		return getRepoAge(commitSha, commitsCount);
	},
	cacheKey: cacheByRepo,
});

async function init(): Promise<void> {
	const [firstCommitDate, firstCommitHref] = await firstCommit.get()!;
	const birthday = new Date(firstCommitDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(birthday.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	// About a day old or less ?
	const age = Date.now() - birthday.getTime() < 10e7
		? fresh[Math.floor(Math.random() * fresh.length)]
		: <><strong>{value}</strong> {unit} old</>;

	const sidebarForksLinkIcon = await elementReady('.BorderGrid .octicon-repo-forked');
	sidebarForksLinkIcon!.closest('.mt-2')!.append(
		<h3 className="sr-only">Repository age</h3>,
		<div className="mt-2">
			<a href={firstCommitHref} className="Link--muted" title={`First commit dated ${dateFormatter.format(birthday)}`}>
				<RepoIcon className="mr-2"/> {age}
			</a>
		</div>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoRoot,
	],
	exclude: [
		pageDetect.isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox
https://github.com/refined-github/sandbox/tree/6619

*/
