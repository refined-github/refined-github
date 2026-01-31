import React from 'dom-chef';
import InfoIcon from 'octicons-plain-react/Info';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import waitForPrMerge from '../github-events/on-pr-merge.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import matchesAnyPattern from '../helpers/matches-any-patterns.js';
import GetPrsToBaseBranch from './pr-branch-auto-delete.gql';

// DO NOT ask for additions or customizations. This is just a list of "obvious" permanent branches.
// Protect your permanent branches instead: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
const exceptions = [
	'dev',
	'develop',
	'development',
	'main',
	'master',
	'next',
	'pre',
	'prod',
	'stage',
	'staging',
	/production/,
	/^release/,
	/^v\d/,
];

async function init(signal: AbortSignal): Promise<void> {
	// Skip branches that are likely to be long-lived https://github.com/refined-github/refined-github/issues/7755
	const {head} = getBranches();
	if (matchesAnyPattern(head.branch, exceptions)) {
		return;
	}

	// Skip branches that have PRs open https://github.com/refined-github/refined-github/issues/7782
	const {repository} = await api.v4(GetPrsToBaseBranch, {
		variables: {
			baseRefName: head.branch,
		},
	});
	if (repository.pullRequests.totalCount) {
		return;
	}

	await waitForPrMerge(signal);

	const deleteButton = await elementReady('[class^="MergeBoxSectionHeader"] button', {
		stopOnDomReady: false,
		signal,
	});
	if (deleteButton?.textContent !== 'Delete branch') {
		return;
	}

	deleteButton.click();

	const deletionEvent = await elementReady('.TimelineItem-body:has(.pull-request-ref-restore-text)', {
		stopOnDomReady: false,
		signal,
	});
	if (!deletionEvent) {
		return;
	}

	const url = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#pr-branch-auto-delete';
	deletionEvent.append(
		<a className="d-inline-block" href={url}>via Refined GitHub <InfoIcon /></a>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenConversation,
	],
	awaitDomReady: true, // Post-load user event, no need to listen earlier
	init,
});

/*

Test URLs:

1. Open https://github.com/pulls
2. Click on any PRs you can merge (in repositories without native auto-delete)
3. Merge the PR

*/
