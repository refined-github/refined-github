import * as pageDetect from 'github-url-detection';
import {StarIcon} from '@primer/octicons-react';
import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GetRepositoryStargazerCount from './repo-header-info.gql';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {cacheByRepo} from '../github-helpers/index.js';

const stargazerCount = new CachedFunction('stargazer-count', {
	async updater(): Promise<number> {
		const {repository: {stargazerCount}} = await api.v4(GetRepositoryStargazerCount);
		return stargazerCount;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function add(repoLink: HTMLAnchorElement): Promise<void> {
	repoLink.append(
		<div className="d-flex flex-items-center flex-justify-center ml-2 gap-1">
			<StarIcon className="v-align-text-bottom" width={12} height={12}/>
			<span className="v-align-bottom">{abbreviateNumber(await stargazerCount.get())}</span>
		</div>,
	);
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

Repository:
https://github.com/refined-github/refined-github

*/
