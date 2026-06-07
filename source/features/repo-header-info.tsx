import './repo-header-info.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import RepoForkedIcon from 'octicons-plain-react/RepoForked';
import StarIcon from 'octicons-plain-react/Star';
import StarFillIcon from 'octicons-plain-react/StarFill';
import {$, closestElement, elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl, cacheByRepo} from '../github-helpers/index.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {appendBefore, isSmallDevice} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import GetRepositoryInfo from './repo-header-info.gql';

type RepositoryInfo = {
	forked?: {url: string};
	isPrivate: boolean;
	stargazerCount: number;
	viewerHasStarred: boolean;
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

function prepareForAddition(repoLink: HTMLAnchorElement): void {
	if (!repoLink.classList.contains('AppHeader-context-item')) {
		closestElement('li', repoLink).classList.add('d-flex');
	}
}

async function add(repoLink: HTMLAnchorElement): Promise<void> {
	const {forked, isPrivate, stargazerCount, viewerHasStarred} = await repositoryInfo.get();

	repoLink.classList.add('rgh-repo-header-info-updated');

	// GitHub may already show this icon natively, so we match its position
	if (isPrivate && !elementExists('.octicon-lock', repoLink)) {
		appendBefore(
			repoLink,
			'.octicon-repo-forked',
			<LockIcon className="ml-1 tmp-ml-1" width={12} height={12} />,
		);
	}

	if (stargazerCount > 1) {
		let tooltip = `Repository starred by ${stargazerCount.toLocaleString('us')} people`;
		if (viewerHasStarred) {
			tooltip += ', including you';
		}

		prepareForAddition(repoLink);

		repoLink.after(
			<a
				href={buildRepoUrl('stargazers')}
				title={tooltip}
				// Hide in small viewports, matches `ci-link`
				className="d-none d-sm-flex flex-items-center flex-justify-center gap-1 p-1 tmp-p-1 color-fg-muted Button Button--invisible"
			>
				{viewerHasStarred
					// Use `color` because `fill` is overridden with `currentColor`
					? <StarFillIcon width={12} height={12} color="var(--button-star-iconColor)" />
					: <StarIcon width={12} height={12} />}
				<span className="f5">{abbreviateNumber(stargazerCount)}</span>
			</a>,
		);
	}

	if (forked) {
		prepareForAddition(repoLink);
		// Only show the clickable button at larger resolutions. Default to the native one on smaller screens
		$('.octicon-repo-forked', repoLink).classList.add('d-sm-none');
		repoLink.after(
			<a
				href={forked.url}
				className="d-none d-sm-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"
			>
				<RepoForkedIcon className='m-0 tmp-m-0' width={12} height={12} />
			</a>,
		);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		[
			'div[data-testid="top-nav-center"] li:last-child > a[class*="prc-Breadcrumbs-Item"]',
			// TODO [2026-06-01]: Drop
			'.AppHeader-context-full [role="listitem"]:last-child a.AppHeader-context-item',
		],
		add,
		{signal},
	);
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,
	],
	requiresToken: true,
	init,
});

/*
Test URLs

- Regular: https://github.com/refined-github/refined-github
- Fork: https://github.com/134130/refined-github
- Private: https://github.com/refined-github/private
- Private fork: https://github.com/refined-github/private-fork

*/
