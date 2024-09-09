import React from 'react';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';

function isSemanticCommitTitleElement(commitTitle: string): boolean {
	// This may not be fully accurate.
	// Tests, if the title string
	// starts with a word,
	// followed by an anything in parentheses,
	// followed by an optional exclamation mark,
	// followed by a colon,
	// followed by anything.
	return /^\w*(?:\(.*\))?!?:.*/.test(commitTitle);
}

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

function isSemanticCommitTitleTypeDefault(semanticCommitTitle: string): boolean {
	// This may not be fully accurate.
	// Gets the first word from the title.
	const type = /^(\w*)/.exec(semanticCommitTitle)?.pop();

	if (!type) {
		return false;
	}

	return defaultCommitTypes.has(type);
}

function extractSemanticCommitTypeAndScope(semanticCommitTitle: string): [string, string?] {
	// Gets the first word from the title.
	const type = /^(\w*)/.exec(semanticCommitTitle)!.pop()!;

	// Gets the word in parentheses from the title.
	const scope = /\((\w*)\)/.exec(semanticCommitTitle)?.pop();

	return [type, scope];
}

function removeSemanticCommitTypeAndScopeFromCommitTitleElement(semanticCommitTitleElement: HTMLElement): void {
	const children = semanticCommitTitleElement.childNodes;

	// Remove all children until the child with a colon is found.
	// Then remove the colon and everything before it.
	for (const child of children) {
		if (child.textContent.includes(':')) {
			child.textContent = child.textContent.split(':').slice(1).join(':');
			break;
		}

		child.remove();
	}
}

const defaultCommitTypesMapping = new Map([
	[
		'feat',
		{
			label: 'Feature',
			colorCssRules: {
				'--label-r': 14,
				'--label-g': 138,
				'--label-b': 22,
				'--label-h': 123,
				'--label-s': 81,
				'--label-l': 29,
			},
		},
	],
	[
		'fix',
		{
			label: 'Fix',
			colorCssRules: {
				'--label-r': 215,
				'--label-g': 58,
				'--label-b': 74,
				'--label-h': 353,
				'--label-s': 66,
				'--label-l': 53,
			},
		},
	],
	[
		'chore',
		{
			label: 'Chore',
			colorCssRules: {
				'--label-r': 170,
				'--label-g': 170,
				'--label-b': 170,
				'--label-h': 0,
				'--label-s': 0,
				'--label-l': 255,
			},
		},
	],
	[
		'refactor',
		{
			label: 'Refactor',
			colorCssRules: {
				'--label-r': 255,
				'--label-g': 150,
				'--label-b': 0,
				'--label-h': 36,
				'--label-s': 100,
				'--label-l': 50,
			},
		},
	],
	[
		'build',
		{
			label: 'Build',
			colorCssRules: {
				'--label-r': 83,
				'--label-g': 25,
				'--label-b': 231,
				'--label-h': 256,
				'--label-s': 81,
				'--label-l': 50,
			},
		},
	],
]);

function createLabelElement(type: string, scope?: string): JSX.Element {
	const {label, colorCssRules} = defaultCommitTypesMapping.get(type)!;

	const isForRepoCommit = pageDetect.isRepoCommitList();

	return (
		<span
			style={{
				marginTop: 0,
				marginLeft: 0,
				fontSize: isForRepoCommit ? 'var(--text-body-size-large)' : 'var(--text-small)',
				fontWeight: 'normal',
				padding: '2px 0.5rem',
				...colorCssRules,
			}}
			className="IssueLabel hx_IssueLabel"
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
	if (!isSemanticCommitTitleElement(commitTitleElement.textContent)) {
		return;
	}

	if (!isSemanticCommitTitleTypeDefault(commitTitleElement.textContent)) {
		return;
	}

	const [type, scope] = extractSemanticCommitTypeAndScope(commitTitleElement.textContent);

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
