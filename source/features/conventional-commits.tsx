import './conventional-commits.css';
import React from 'react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {parseConventionalCommit, removeCommitAndScope} from '../helpers/conventional-commits.js';

const types = new Map([
	['feat', 'Feature'],
	['fix', 'Fix'],
	['chore', 'Chore'],
	['docs', 'Docs'],
	['build', 'Build'],
	['refactor', 'Refactor'],
	['test', 'Test'],
	['ci', 'CI'],
	['perf', 'Performance'],
]);

function createLabelElement(type: string, scope?: string): JSX.Element {
	const label = types.get(type)!;

	return (
		<span className={`IssueLabel hx_IssueLabel rgh-commit-type-label rgh-commit-type-label-${type}-colors`}>
			{scope ? `${label}: ${scope}` : label}
		</span>
	);
}

function renderLabelInCommitTitle(commitTitleElement: HTMLElement): void {
	const match = parseConventionalCommit(commitTitleElement.textContent);

	const {type, scope} = match?.groups ?? {};
	if (!type || !types.has(type)) {
		return;
	}

	removeCommitAndScope(commitTitleElement, match!);
	commitTitleElement.prepend(createLabelElement(type, scope));
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
