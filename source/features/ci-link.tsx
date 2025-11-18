import './ci-link.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoURL} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import getChecks from './ci-link.gql';
import {expectToken} from '../github-helpers/github-token.js';
import {isSmallDevice} from '../helpers/dom-utils.js';

async function getCommitWithChecks(): Promise<string | undefined> {
	const {repository} = await api.v4(getChecks);
	// Check earlier commits just in case the last one is CI-generated and doesn't have checks
	for (const commit of repository.defaultBranchRef.target.history.nodes) {
		if (commit.statusCheckRollup) {
			return commit.oid;
		}
	}

	return undefined;
}

async function add(anchor: HTMLElement): Promise<void> {
	const commit = await getCommitWithChecks();
	if (!commit) {
		return;
	}

	const endpoint = buildRepoURL('commits/checks-statuses-rollups');
	anchor.parentElement!.append(
		// Hide in small viewports, matches `repo-header-info`
		<span className="rgh-ci-link ml-1 d-none d-sm-inline" title="CI status of latest commit">
			<batch-deferred-content hidden data-url={endpoint}>
				<input
					name="oid"
					value={commit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>,
	);

	// A parent is clipping the popup
	anchor.closest('.AppHeader-context-full')?.style.setProperty('overflow', 'visible');
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	observe([
		// Desktop
		'.AppHeader-context-item:not([data-hovercard-type])',

		// Mobile. `> *:first-child` avoids finding our own element
		'.AppHeader-context-compact-mainItem > span:first-child',
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,
	],
	init,
});

/*
Test URLs

CI:
https://github.com/refined-github/refined-github

No CI:
https://github.com/fregante/.github
*/
