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
		<span className="IssueLabel hx_IssueLabel mr-1" rgh-conventional-commits={commit.type}>
			{commit.label}
		</span>,
	);

	removeCommitAndScope(textNode);
}

function initRepoCommitList(signal: AbortSignal): void {
	observe(`:is(${commitTitleInLists}) h4 > span`, renderLabelInCommitTitle, {signal});
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

https://github.com/semantic-release/semantic-release/commits/master/
https://github.com/ReVanced/revanced-patches/commits/main/

*/
