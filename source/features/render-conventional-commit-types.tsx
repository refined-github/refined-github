import './render-conventional-commit-types.css';
import React from 'react';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {getConventionalCommitAndScopeMatch, removeCommitAndScope} from '../helpers/render-conventional-commit-types.js';

const commitTypeLabelMapping = new Map([
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

const commitTypes = new Set(commitTypeLabelMapping.keys());

function createLabelElement(type: string, scope?: string): JSX.Element {
	const label = commitTypeLabelMapping.get(type)!;

	return (
		<span className={`IssueLabel hx_IssueLabel rgh-commit-type-label rgh-commit-type-label-${type}-colors`}>
			{scope ? `${label}: ${scope}` : label}
		</span>
	);
}

function renderLabelInCommitTitle(commitTitleElement: HTMLElement): void {
	const match = getConventionalCommitAndScopeMatch(commitTitleElement.textContent);

	const {type, scope} = match?.groups ?? {};
	if (!type || !commitTypes.has(type)) {
		return;
	}

	removeCommitAndScope(commitTitleElement, match!);
	commitTitleElement.prepend(createLabelElement(type, scope));
}

function renderLabelInRepoCommitTitle(commitTitleElement: HTMLElement): void {
	const repoCommitTitleElement = $('h4 > span', commitTitleElement)!;
	renderLabelInCommitTitle(repoCommitTitleElement);
}

function renderLabelInPRCommitTitle(commitTitleElement: HTMLElement): void {
	const prCommitTitleElement = $('a', commitTitleElement)!;
	renderLabelInCommitTitle(prCommitTitleElement);
}

function initRepoCommitList(signal: AbortSignal): void {
	observe(commitTitleInLists + ' h4 > span', renderLabelInPRCommitTitle, {signal});
}

function initPrCommitList(signal: AbortSignal): void {
	observe(commitTitleInLists + ' a', renderLabelInRepoCommitTitle, {signal});
}

void features.add(import.meta.url, {
	include: [pageDetect.isCommitList],
	init: initRepoCommitList,
}, {
	include: [pageDetect.isPRCommitList],
	init: initPrCommitList,
});

/*

Test URLs:

https://github.com/semantic-release/semantic-release/commits/master/
https://github.com/ReVanced/revanced-patches/commits/main/

*/
