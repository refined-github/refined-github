import './conventional-commits.css';
import React from 'react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {parseConventionalCommit, removeCommitAndScope} from '../helpers/conventional-commits.js';

function renderLabelInCommitTitle(commitTitleElement: HTMLElement): void {
	const textNode = commitTitleElement.firstChild!;
	const commit = parseConventionalCommit(textNode.textContent);

	if (!commit) {
		return;
	}

	commitTitleElement.prepend(
		<span className="IssueLabel hx_IssueLabel mr-2" rgh-conventional-commits={commit.rawType}>
			{commit.type}
		</span>,
		commit.scope ? <em>{commit.scope}</em> : '',
	);

	removeCommitAndScope(textNode);
}

function initRepoCommitList(signal: AbortSignal): void {
	observe(`:is(${commitTitleInLists}) h4 > span > a:first-child`, renderLabelInCommitTitle, {signal});
}

function initPrCommitList(signal: AbortSignal): void {
	observe(`:is(${commitTitleInLists}) a`, renderLabelInCommitTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init: initRepoCommitList,
}, {
	include: [
		pageDetect.isPRCommitList,
	],
	init: initPrCommitList,
});

/*

Test URLs:

- Repo commits: https://github.com/refined-github/sandbox/commits/conventional-commits/
- PR commits: https://github.com/refined-github/sandbox/pull/91/commits
- Real data: https://github.com/semantic-release/semantic-release/commits

*/
