import React from 'dom-chef';
import {$} from 'select-dom';

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo, {PullRequestInfo} from '../github-helpers/get-pr-info.js';
import pluralize from '../helpers/pluralize.js';
import {buildRepoURL} from '../github-helpers/index.js';
import {linkifyCommit} from '../github-helpers/dom-formatters.js';
import {isTextNodeContaining} from '../helpers/dom-utils.js';

function getBaseCommitNotice(prInfo: PullRequestInfo): JSX.Element {
	const {base} = getBranches();
	const commit = linkifyCommit(prInfo.baseRefOid);
	const count = pluralize(prInfo.behindBy, '$$ commit');
	const countLink = (
		<a href={buildRepoURL('compare', `${prInfo.baseRefOid.slice(0, 8)}...${base.branch}`)}>
			{count}
		</a>
	);
	return (
		<div>It’s {countLink} behind (base commit: {commit})</div>
	);
}

async function addInfo(statusMeta: Element): Promise<void> {
	// Selector copied from GitHub. Don't @ me
	// This excludes hidden ".status-meta" items without adding this longass selector to the observer
	// Added: .rgh-update-pr-from-base-branch-row
	if (!statusMeta.closest('.merge-pr.is-merging .merging-body, .merge-pr.is-merging .merge-commit-author-email-info, .merge-pr.is-merging-solo .merging-body, .merge-pr.is-merging-jump .merging-body, .merge-pr.is-merging-group .merging-body, .merge-pr.is-rebasing .rebasing-body, .merge-pr.is-squashing .squashing-body, .merge-pr.is-squashing .squash-commit-author-email-info, .merge-pr.is-merging .branch-action-state-error-if-merging .merging-body-merge-warning, .rgh-update-pr-from-base-branch-row')) {
		return;
	}

	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);
	if (!prInfo.needsUpdate) {
		return;
	}

	const previousMessage = statusMeta.firstChild!; // Extract now because it won't be the first child anymore
	statusMeta.prepend(getBaseCommitNotice(prInfo));
	if (isTextNodeContaining(previousMessage, 'Merging can be performed automatically.')) {
		previousMessage.remove();
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	observe('.branch-action-item .status-meta', addInfo, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedPR,
		() => $('.head-ref')!.title === 'This repository has been deleted',
	],
	awaitDomReady: true, // DOM-based exclusions
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/60

Draft PR without conflicts
https://github.com/refined-github/sandbox/pull/61

Native "Update branch" button
(pick a conflict-free PR from https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+sort%3Acreated-asc)

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9

Cross-repo PR with long branch names
https://github.com/refined-github/sandbox/pull/13

*/
