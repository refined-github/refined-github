import * as pageDetect from 'github-url-detection';
import {RepoForkedIcon, StarFillIcon} from '@primer/octicons-react';
import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import GetRepositoryDetails from './detailed-repo-header.gql';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {cacheByRepo} from '../github-helpers/index.js';

type ForkAndStarCount = {
	forkCount: number;
	stargazerCount: number;
};

const forkAndStarCount = new CachedFunction('fork-and-star-count', {
	async updater(): Promise<ForkAndStarCount> {
		const {repository: {forkCount, stargazerCount}} = await api.v4(GetRepositoryDetails);
		return {forkCount, stargazerCount};
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

function createForkCounter(forkCount: number): HTMLElement {
	return (
		<div>
			<RepoForkedIcon className="mr-1"/>
			<span className="Counter">{abbreviateNumber(forkCount)}</span>
		</div>
	);
}

function createStarCounter(stargazerCount: number): HTMLElement {
	return (
		<div className="starred ml-2">
			<StarFillIcon className="starred-button-icon mr-1"/>
			<span className="Counter">{abbreviateNumber(stargazerCount)}</span>
		</div>
	);
}

async function addForFull(navigationList: HTMLUListElement): Promise<void> {
	const {forkCount, stargazerCount} = await forkAndStarCount.get();

	navigationList.append(
		<li className="color-fg-muted pl-2">
			{createForkCounter(forkCount)}
			{createStarCounter(stargazerCount)}
		</li>,
	);
}

async function addForCompact(button: HTMLButtonElement): Promise<void> {
	const {forkCount, stargazerCount} = await forkAndStarCount.get();
	button.style.setProperty('grid-auto-flow', 'column');
	button.append(
		<div className="color-fg-muted pl-2 d-inline-flex">
			{createForkCounter(forkCount)}
			{createStarCounter(stargazerCount)}
		</div>,
	);
}

function init(signal: AbortSignal): void {
	observe('header nav[role="navigation"] > ul', addForFull, {signal});
	observe('.AppHeader-context-compact > button', addForCompact, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*
Test URLs

Issues:
https://github.com/refined-github/refined-github/issues

Pulls:
https://github.com/refined-github/refined-github/pulls

Blobs:
https://github.com/refined-github/refined-github/blob/main/source/features/bugs-tab.tsx

*/
