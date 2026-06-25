import './display-issue-fields.css';
import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElement, elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

// https://docs.github.com/en/graphql/reference/unions#issuefieldvalue
type FieldValue = {
	__typename: string;
	field?: {name: string};
	name?: string; // `IssueFieldSingleSelectValue`: option name
	color?: string; // `IssueFieldSingleSelectValue`: option color (enum or hex)
	number?: number; // `IssueFieldNumberValue`
	text?: string; // `IssueFieldTextValue`
	date?: string; // `IssueFieldDateValue`
	value?: string; // `IssueFieldMultiSelectValue`: comma-separated option names
};

type IssueFields = {
	issueFieldValues: {
		nodes: FieldValue[];
	};
};

// Maps GitHub's single-select option color enum to Primer semantic color tokens, so the
// badge reuses the exact tint GitHub shows in the issue sidebar (and adapts to dark mode).
const colorTokens: Record<string, string> = {
	gray: 'neutral',
	blue: 'accent',
	green: 'success',
	yellow: 'attention',
	orange: 'severe',
	red: 'danger',
	pink: 'sponsors',
	purple: 'done',
};

const fieldValuesCache = new CachedFunction('issue-fields', {
	async updater(issueNumbers: number[]): Promise<Record<string, IssueFields>> {
		const {repository} = await api.v4(`
			repository() {
				${
					issueNumbers.map(number => `
						${api.escapeKey(number)}: issue(number: ${number}) {
							issueFieldValues(first: 20) {
								nodes {
									__typename
									... on IssueFieldValueCommon {
										field {
											... on IssueFieldCommon {
												name
											}
										}
									}
									... on IssueFieldSingleSelectValue { name color }
									... on IssueFieldNumberValue { number: value }
									... on IssueFieldTextValue { text: value }
									... on IssueFieldDateValue { date: value }
									... on IssueFieldMultiSelectValue { value }
								}
							}
						}
					`).join('\n')
				}
			}
		`);

		return repository;
	},
	maxAge: {minutes: 10},
	cacheKey: ([issues]) => `${getRepo()!.nameWithOwner}:${String(issues)}`,
});

function getIssueNumber(link: HTMLAnchorElement): number {
	return Number(link.pathname.split('/', 5)[4]);
}

function renderValue(value: FieldValue): JSX.Element | undefined {
	let label: string | undefined;
	let token: string | undefined;

	switch (value.__typename) {
		case 'IssueFieldSingleSelectValue': {
			label = value.name;
			token = value.color ? colorTokens[value.color.toLowerCase()] : undefined;
			break;
		}

		case 'IssueFieldNumberValue': {
			label = value.number === undefined ? undefined : String(value.number);
			break;
		}

		case 'IssueFieldTextValue': {
			label = value.text;
			break;
		}

		case 'IssueFieldDateValue': {
			label = value.date;
			break;
		}

		case 'IssueFieldMultiSelectValue': {
			label = value.value ?? undefined;
			break;
		}

		default: {
			return;
		}
	}

	if (!label) {
		return;
	}

	const style = token
		? {
			color: `var(--fgColor-${token})`,
			backgroundColor: `var(--bgColor-${token}-muted)`,
			borderColor: `var(--borderColor-${token}-muted, var(--bgColor-${token}-muted))`,
		}
		: undefined;

	return (
		<span className="rgh-issue-field" style={style} title={value.field ? `${value.field.name}: ${label}` : label}>
			{label}
		</span>
	);
}

async function add(issueLinks: HTMLAnchorElement[]): Promise<void> {
	const linksByNumber = new Map(issueLinks.map(link => [getIssueNumber(link), link]));
	const fields = await fieldValuesCache.get([...linksByNumber.keys()]);

	for (const [number, link] of linksByNumber) {
		const row = closestElement('li', link);
		if (elementExists('.rgh-issue-field', row)) {
			continue;
		}

		// The issue is missing only if it was transferred/deleted between the list render and this query
		const issue = fields[api.escapeKey(number)];
		const nodes = issue ? issue.issueFieldValues.nodes : [];
		const badges = nodes.flatMap(value => {
			const badge = renderValue(value);
			return badge ? [badge] : [];
		});
		if (badges.length === 0) {
			continue;
		}

		// Sit right after the issue type token; otherwise lead the `#123 · author …` line
		const issueType = $optional('[class*="IssueTypeIndicator-module__container"]', row);
		if (issueType) {
			issueType.after(...badges);
		} else {
			const description = $optional('[class*="Description-module__container"]', row);
			if (description) {
				description.prepend(...badges);
			}
		}
	}
}

function init(signal: AbortSignal): void {
	observe('a[data-hovercard-type="issue"][data-testid="issue-pr-title-link"]', batchedFunction(add, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

Requires an organization with Issue fields enabled (public preview) and at least one field set on an issue:
https://github.com/refined-github/sandbox/issues

*/
