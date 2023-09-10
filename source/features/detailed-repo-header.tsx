import * as pageDetect from 'github-url-detection';
import { StarFillIcon } from '@primer/octicons-react';
import React from 'dom-chef';
import { CachedFunction } from 'webext-storage-cache';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GetRepositoryStargazerCount from './detailed-repo-header.gql';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import { cacheByRepo } from '../github-helpers/index.js';

const getStargazerCount = new CachedFunction('stargazer-count', {
	async updater(): Promise<number> {
		const {repository: {stargazerCount}} = await api.v4(GetRepositoryStargazerCount);
		return stargazerCount;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function addForFull(navigationList: HTMLUListElement): Promise<void> {
	const stargazerCount =  await getStargazerCount.get();

	navigationList.append(
		<li className="color-fg-muted pl-2">
			<div className="starred ml-2">
				<StarFillIcon className="starred-button-icon mr-1"/>
				<span className="Counter">{abbreviateNumber(stargazerCount)}</span>
			</div>
		</li>,
	);
}

function init(signal: AbortSignal): void {
	observe('header .AppHeader-context-full > nav ul', addForFull, {signal});
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
