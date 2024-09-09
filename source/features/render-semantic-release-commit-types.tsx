import './render-semantic-release-commit-types.css';
import React from 'react';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';
import {getSemanticCommitAndScope, strip} from '../helpers/render-semantic-release-commit-types.js';

const defaultCommitTypes = new Set([
	'feat',
	'fix',
	'chore',
	'docs',
	'build',
	'refactor',
	'test',
	'ci',
	'perf',
]);

const defaultCommitTypesToLabelMapping = new Map([
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

function removeSemanticCommitTypeAndScopeFromCommitTitleElement(semanticCommitTitleElement: HTMLElement): void {
	const [type, scope] = getSemanticCommitAndScope(semanticCommitTitleElement.textContent)!;

	const semanticCommitTypeAndScope = scope ? `${type}(${scope}):` : `${type}:`;

	strip(semanticCommitTitleElement, semanticCommitTypeAndScope);
}

function isSemanticCommitTitleTypeDefault(semanticCommitTitle: string): boolean {
	const match = getSemanticCommitAndScope(semanticCommitTitle);

	if (match) {
		const [type] = match;

		return defaultCommitTypes.has(type);
	}

	return false;
}

function createLabelElement(type: string, scope?: string): JSX.Element {
	const label = defaultCommitTypesToLabelMapping.get(type)!;

	return (
		<span className={`IssueLabel hx_IssueLabel 
				rgh-render-semantic-release-commit-types-label 
				rgh-render-semantic-release-commit-types-${type}-label-colors`}
		>
			{scope ? `${label}: ${scope}` : label}
		</span>
	);
}

function prependLabelToSemanticCommitTitleElement(semanticCommitTitleElement: HTMLElement, type: string, scope?: string): void {
	const labelElement = createLabelElement(type, scope);

	semanticCommitTitleElement.prepend(labelElement);
}

function renderLabelInCommitTitle(commitTitleElement: HTMLElement): void {
	if (!getSemanticCommitAndScope(commitTitleElement.textContent)) {
		return;
	}

	if (!isSemanticCommitTitleTypeDefault(commitTitleElement.textContent)) {
		return;
	}

	const [type, scope] = getSemanticCommitAndScope(commitTitleElement.textContent)!;

	removeSemanticCommitTypeAndScopeFromCommitTitleElement(commitTitleElement);
	prependLabelToSemanticCommitTitleElement(commitTitleElement, type, scope);
}

function renderLabelInPRCommitTitle(commitTitleElement: HTMLElement): void {
	const prCommitTitleElement = $('a', commitTitleElement)!;
	renderLabelInCommitTitle(prCommitTitleElement);
}

function renderLabelInRepoCommitTitle(commitTitleElement: HTMLElement): void {
	const repoCommitTitleElement = $('h4 > span', commitTitleElement)!;
	renderLabelInCommitTitle(repoCommitTitleElement);
}

function init(signal: AbortSignal): void {
	const renderLabelInCommitTitle = pageDetect.isRepoCommitList()
		? renderLabelInRepoCommitTitle
		: renderLabelInPRCommitTitle;

	observe(commitTitleInLists, renderLabelInCommitTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
	],
	init,
});
