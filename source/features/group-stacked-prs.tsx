import './group-stacked-prs.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronDownIcon from 'octicons-plain-react/ChevronDown';
import ChevronRightIcon from 'octicons-plain-react/ChevronRight';
import {$, $optional, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';

const prLinkSelector = [
	'.js-issue-row a[data-hovercard-type="pull_request"]', // Repo and global PR lists
	'li[class*="listItem"] [class*="heading"] > a[class*="anchor"][href*="/pull/"]', // React issue and PR lists
];

// Stacks the user expanded; survives re-layouts triggered by new rows
const expandedStacks = new Set<string>();

function getRow(prLink: HTMLElement): HTMLElement {
	return closestElement([
		'.js-issue-row', // Legacy DOM
		'li',
	], prLink);
}

function renderToggle(header: HTMLElement, stack: string, hiddenCount: number, relayout: () => void): void {
	// Missing on the first layout of each stack
	$optional('.rgh-stack-toggle', header)?.remove();
	if (hiddenCount === 0) {
		return;
	}

	const isExpanded = expandedStacks.has(stack);
	const toggle = (
		<button
			type="button"
			className="rgh-stack-toggle"
			aria-expanded={isExpanded}
			aria-label={isExpanded ? 'Collapse stack' : `Show ${hiddenCount} more stacked PRs`}
			onClick={(event: React.MouseEvent) => {
				event.preventDefault();
				event.stopPropagation();
				if (isExpanded) {
					expandedStacks.delete(stack);
				} else {
					expandedStacks.add(stack);
				}

				relayout();
			}}
		>
			{isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
		</button>
	);
	// Next to GitHub's own `1/N` stack counter, so titles stay aligned with other rows
	$('.octicon-stack', header).parentElement!.after(toggle);
}

// Uses CSS `order` instead of moving rows, so GitHub's own DOM stays untouched
function layoutStacks(list: HTMLElement): void {
	const rowsByStack = new Map<string, HTMLElement[]>();
	for (const [index, row] of [...list.children].entries()) {
		if (!(row instanceof HTMLElement)) {
			continue;
		}

		const {rghStack} = row.dataset;
		if (!rghStack) {
			row.style.order = String(index * 1000);
			continue;
		}

		// Each stack takes the slot of its first visible PR
		const rows = rowsByStack.get(rghStack) ?? [];
		rows.push(row);
		rowsByStack.set(rghStack, rows);
		row.dataset.rghStackSlot ??= String(index);
	}

	for (const [stack, rows] of rowsByStack) {
		rows.sort((a, b) => Number(a.dataset.rghStackPosition) - Number(b.dataset.rghStackPosition));
		const slot = Math.min(...rows.map(row => Number(row.dataset.rghStackSlot)));
		const isExpanded = expandedStacks.has(stack);
		for (const [index, row] of rows.entries()) {
			row.style.order = String((slot * 1000) + index + 1);
			// The first visible PR is the header; the rest hang from it as one indented level
			row.classList.toggle('rgh-stack-child', index > 0);
			row.classList.toggle('rgh-stack-last', index > 0 && index === rows.length - 1);
			row.hidden = index > 0 && !isExpanded;
		}

		renderToggle(rows[0], stack, rows.length - 1, () => {
			layoutStacks(list);
		});
	}

	list.classList.add('rgh-group-stacked-prs');
}

async function group(links: HTMLAnchorElement[]): Promise<void> {
	// GitHub only shows `.octicon-stack` on stacked PRs, so the others need no API call
	const prs = links
		.filter(link => elementExists('.octicon-stack', getRow(link)))
		.map(link => {
			const [, owner, repo, , number] = link.pathname.split('/', 5);
			return {link, owner, repo, number, key: api.escapeKey(owner, repo, number)};
		});

	if (prs.length === 0) {
		return;
	}

	const data = await api.v4(
		prs.map(({key, owner, repo, number}) => `
		${key}: repository(owner: "${owner}", name: "${repo}") {
			pullRequest(number: ${number}) {
				stack { number }
				stackEntry { position }
			}
		}
	`).join('\n'),
	);

	for (const pr of prs) {
		const {stack, stackEntry} = data[pr.key].pullRequest;
		if (!stack || !stackEntry) {
			continue;
		}

		const row = getRow(pr.link);
		row.dataset.rghStack = `${pr.owner}/${pr.repo}#${stack.number}`;
		row.dataset.rghStackPosition = String(stackEntry.position);
	}

	layoutStacks(getRow(prs[0].link).parentElement!);
}

function init(signal: AbortSignal): void {
	observe(prLinkSelector, batchedFunction(group, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- Repo PR list: https://github.com/Jarrioja/rgh-stacked-pr-sandbox/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc
- Global PR list: https://github.com/pulls?q=is%3Apr+is%3Aopen+repo%3AJarrioja%2Frgh-stacked-pr-sandbox+sort%3Aupdated-desc

*/
