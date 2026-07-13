import './repo-header-info.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import {$, closestElement, elementExists} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {appendBefore, isSmallDevice} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import GetRepoInfo from './repo-header-info.gql';
import RepoHeaderInfo from './repo-header-info.svelte';

export type RepositoryInfo = {
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

	return {...repository, ciCommit};
}

async function add(repoLink: HTMLElement): Promise<void> {
	const info = await getRepositoryInfo();
	const li = closestElement('li', repoLink);
	li.classList.add('rgh-repo-header-info-updated');

	// GitHub may already show this icon natively, so we match its position
	// It's generally missing when it's forked and private
	if (info.isPrivate && !elementExists('.octicon-lock', repoLink)) {
		appendBefore(
			repoLink,
			'.octicon-repo-forked',
			<LockIcon className="mr-1 tmp-mr-1 v-align-middle" width={12} height={12} />,
		);
	}

	if (info.forked) {
		// Only show the clickable button at larger resolutions. Default to the native one on smaller screens
		$('.octicon-repo-forked', repoLink).classList.add('d-lg-none');
	}

	mount(RepoHeaderInfo, {
		target: closestElement('ol', repoLink),
		props: {info},
	});
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		'.loaded div[data-testid="top-nav-center"] li:last-child > a[class*="prc-Breadcrumbs-Item"]',
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
