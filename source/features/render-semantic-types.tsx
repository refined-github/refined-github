import React from 'react';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

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

function extractSemanticCommitTitleTypeAndScope(semanticCommitTitle: string): [string, string?] {
	// Gets the first word from the title.
	const type = /^(\w*)/.exec(semanticCommitTitle)!.pop()!;

	// Gets the word in parentheses from the title.
	const scope = /\((\w*)\)/.exec(semanticCommitTitle)?.pop();

	return [type, scope];
}

function removeSemanticCommitTitleAndScopeFromTitleElement(semanticCommitTitleElement: HTMLElement): void {
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

	return (
		<span
			style={{
				marginTop: 0,
				marginLeft: 0,
				fontSize: 'var(--text-body-size-large)',
				fontWeight: 500,
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

function init(): void {
	// commitTitleInLists helper function may be used here.
	const commitTitleElementsOnPage = $$('[data-testid="list-view-item-title-container"] > h4 > span');

	const semanticCommitTitleElementsOnPage = commitTitleElementsOnPage.filter(commitTitleElement =>
		isSemanticCommitTitleElement(commitTitleElement.textContent),
	);
	const defaultSemanticCommitTitleElementsOnPage = semanticCommitTitleElementsOnPage.filter(semanticCommitTitleElement =>
		isSemanticCommitTitleTypeDefault(semanticCommitTitleElement.textContent),
	);

	for (const semanticCommitTitleElement of defaultSemanticCommitTitleElementsOnPage) {
		const [type, scope] = extractSemanticCommitTitleTypeAndScope(semanticCommitTitleElement.textContent);

		removeSemanticCommitTitleAndScopeFromTitleElement(semanticCommitTitleElement);
		prependLabelToSemanticCommitTitleElement(semanticCommitTitleElement, type, scope);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
	],
	awaitDomReady: true,
	init,
});
