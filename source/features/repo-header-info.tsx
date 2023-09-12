import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon, StarIcon} from '@primer/octicons-react';
import React from 'dom-chef';
import select from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GetRepositoryInfo from './repo-header-info.gql';
import {cacheByRepo} from '../github-helpers/index.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';

type RepositoryInfo = {
	isFork: boolean;
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
	const {isFork, stargazerCount} = await repositoryInfo.get();

	if (isFork && !select.exists('.octicon-repo-forked', repoLink)) {
		// Place it where the "private" lock icon also appears
		repoLink.append(
			<RepoForkedIcon className="ml-1" width={12} height={12}/>,
		);
	}

	if (stargazerCount) {
		repoLink.after(
			<div className="d-flex flex-items-center flex-justify-center mr-1 gap-1">
				<StarIcon className="ml-1" width={12} height={12}/>
				<span className="f6">{abbreviateNumber(stargazerCount)}</span>
			</div>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe('header .AppHeader-context-full li:last-child a', add, {signal});
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
- Private forks are not allowed on GitHub

*/