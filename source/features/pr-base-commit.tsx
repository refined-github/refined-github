import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo, {type PullRequestInfo} from '../github-helpers/get-pr-info.js';
import pluralize from '../helpers/pluralize.js';
import {buildRepoURL} from '../github-helpers/index.js';
import {linkifyCommit} from '../github-helpers/dom-formatters.js';
import {isTextNodeContaining} from '../helpers/dom-utils.js';
import {expectToken} from '../github-helpers/github-token.js';
import {deletedHeadRepository, prMergeabilityBoxCaption} from '../github-helpers/selectors.js';

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
	await expectToken();

	observe(
		prMergeabilityBoxCaption,
		addInfo,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		pageDetect.isClosedConversation,
		() => elementExists(deletedHeadRepository),
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
