import * as pageDetect from 'github-url-detection';
import {LockIcon, RepoForkedIcon, StarIcon} from '@primer/octicons-react';
import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GetRepositoryInfo from './repo-header-info.gql';
import {buildRepoURL, cacheByRepo} from '../github-helpers/index.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';

type RepositoryInfo = {
	isFork: boolean;
	isPrivate: boolean;
	stargazerCount: number;
};

const repositoryInfo = new CachedFunction('stargazer-count', {
	async updater(): Promise<RepositoryInfo> {
		const {repository} = await api.v4(GetRepositoryInfo);
		return repository;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function add(repoLink: HTMLAnchorElement): Promise<void> {
	const {isFork, isPrivate, stargazerCount} = await repositoryInfo.get();

	// GitHub may already show this icon natively, so we match its position
	if (isPrivate && !elementExists('.octicon-lock', repoLink)) {
		repoLink.append(
			<LockIcon className="ml-1" width={12} height={12}/>,
		);
	}

	// GitHub may already show this icon natively, so we match its position
	if (isFork && !elementExists('.octicon-repo-forked', repoLink)) {
		repoLink.append(
			<RepoForkedIcon className="ml-1" width={12} height={12}/>,
		);
	}

	if (stargazerCount > 1) {
		repoLink.after(
			<a
				href={buildRepoURL('stargazers')}
				title={`Repository starred by ${stargazerCount.toLocaleString('us')} people`}
				className="d-flex flex-items-center flex-justify-center mr-1 gap-1 color-fg-muted"
			>
				<StarIcon className="ml-1" width={12} height={12}/>
				<span className="f5">{abbreviateNumber(stargazerCount)}</span>
			</a>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('.AppHeader-context-full li:last-child a.AppHeader-context-item', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*
Test URLs

- Regular: https://github.com/refined-github/refined-github
- Fork: https://github.com/134130/refined-github
- Fork with native icon: https://github.com/refined-github/fork
- Private: https://github.com/refined-github/private
- Private fork: https://github.com/refined-github/fork

*/
