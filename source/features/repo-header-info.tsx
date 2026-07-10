import './repo-header-info.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import RepoForkedIcon from 'octicons-plain-react/RepoForked';
import StarIcon from 'octicons-plain-react/Star';
import StarFillIcon from 'octicons-plain-react/StarFill';
import {$, closestElement, closestElementOptional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import abbreviateNumber from '../helpers/abbreviate-number.js';
import {appendBefore, isSmallDevice} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import GetRepoInfo from './repo-header-info.gql';

type RepositoryInfo = {
	forked?: {url: string};
	isPrivate: boolean;
	stargazerCount: number;
	viewerHasStarred: boolean;
	ciCommit?: string;
};

async function getRepositoryInfo(): Promise<RepositoryInfo> {
	const {repository} = await api.v4(GetRepoInfo);

	let ciCommit: string | undefined;
	if (!repository.isEmpty && repository.defaultBranchRef) {
		// Check earlier commits just in case the last one is CI-generated and doesn't have checks
		for (const commit of repository.defaultBranchRef.target.history.nodes) {
			if (!commit.statusCheckRollup) {
				continue;
			}

			ciCommit = commit.oid;
			break;
		}
	}

	return {
		...repository,
		ciCommit,
	};
}

function prepareForAddition(element: HTMLElement): void {
	if (!element.classList.contains('AppHeader-context-item')) {
		closestElement('li', element).classList.add('d-flex');
	}
}

function markPrivate(repoLink: HTMLElement, isPrivate: boolean): void {
	// GitHub may already show this icon natively, so we match its position
	if (isPrivate && !elementExists('.octicon-lock', repoLink)) {
		appendBefore(
			repoLink,
			'.octicon-repo-forked',
			<LockIcon className="ml-1 tmp-ml-1" width={12} height={12} />,
		);
	}
}

function addStars(repoLink: HTMLElement, stargazerCount: number, viewerHasStarred: boolean): void {
	if (stargazerCount <= 1) {
		return;
	}

	let tooltip = `Repository starred by ${stargazerCount.toLocaleString('us')} people`;
	if (viewerHasStarred) {
		tooltip += ', including you';
	}

	prepareForAddition(repoLink);

	closestElement('li', repoLink).after(
		<a
			href={buildRepoUrl('stargazers')}
			title={tooltip}
			// Hide in small viewports
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

function markForked(repoLink: HTMLElement, forked?: {url: string}): void {
	if (!forked) {
		return;
	}

	prepareForAddition(repoLink);
	// Only show the clickable button at larger resolutions. Default to the native one on smaller screens
	$('.octicon-repo-forked', repoLink).classList.add('d-sm-none');
	closestElement('li', repoLink).after(
		<a
			href={forked.url}
			className="d-none d-sm-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"
		>
			<RepoForkedIcon className='m-0 tmp-m-0' width={12} height={12} />
		</a>,
	);
}

function addCiStatus(anchor: HTMLElement, ciCommit: string | undefined): void {
	if (!ciCommit) {
		return;
	}

	prepareForAddition(anchor);

	const endpoint = buildRepoUrl('commits/checks-statuses-rollups');
	closestElement('li', anchor).after(
		// Hide in small viewports
		<span
			className="rgh-ci-link d-none d-sm-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"
			title="CI status of latest commit"
		>
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={ciCommit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>,
	);

	// A parent is clipping the popup
	closestElementOptional('.AppHeader-context-full', anchor)?.style.setProperty('overflow', 'visible');
}

async function add(repoLink: HTMLElement): Promise<void> {
	const info = await getRepositoryInfo();

	closestElement('li', repoLink).classList.add('rgh-repo-header-info-updated');

	markPrivate(repoLink, info.isPrivate);
	addCiStatus(repoLink, info.ciCommit);
	addStars(repoLink, info.stargazerCount, info.viewerHasStarred);
	markForked(repoLink, info.forked);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		[
			'.loaded div[data-testid="top-nav-center"] li:last-child > a[class*="prc-Breadcrumbs-Item"]',
			// TODO [2026-08-01]: Remove
			// Desktop
			'.AppHeader-context-item:not([data-hovercard-type])',

			// Mobile. `> *:first-child` avoids finding our own element
			'.AppHeader-context-compact-mainItem > span:first-child',
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
- CI: https://github.com/refined-github/refined-github
- No CI: https://github.com/fregante/.github
*/
