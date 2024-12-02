import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import InfoIcon from 'octicons-plain-react/Info';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import onPrMerge from '../github-events/on-pr-merge.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import matchesAnyPattern from '../helpers/matches-any-patterns.js';
import GetPrsToBaseBranch from './pr-branch-auto-delete.gql';

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

async function init(): Promise<void> {
	const deleteButton = $optional('[action$="/cleanup"] [type="submit"]');
	if (!deleteButton) {
		return;
	}

	// Skip branches that are likely to be long-lived https://github.com/refined-github/refined-github/issues/7755
	const {head} = getBranches();
	if (matchesAnyPattern(head.name, exceptions)) {
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

	deleteButton.dataset.disableWith = 'Auto-deleting…';
	deleteButton.click();

	const deletionEvent = await elementReady('.TimelineItem-body:has(.pull-request-ref-restore-text)', {
		stopOnDomReady: false,
		timeout: 2000,
	});

	const url = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#pr-branch-auto-delete';
	deletionEvent!.append(
		<a className="d-inline-block" href={url}>via Refined GitHub <InfoIcon /></a>,
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenConversation,
	],
	awaitDomReady: true, // Post-load user event, no need to listen earlier
	init(signal: AbortSignal): void {
		onPrMerge(init, signal);
	},
});

/*

Test URLs:

1. Open https://github.com/pulls
2. Click on any PRs you can merge (in repositories without native auto-delete)
3. Merge the PR

*/
