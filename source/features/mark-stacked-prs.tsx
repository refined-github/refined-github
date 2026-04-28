import './mark-stacked-prs.css';

import batchedFunction from 'batched-function';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronDownIcon from 'octicons-plain-react/ChevronDown';
import ChevronRightIcon from 'octicons-plain-react/ChevronRight';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {expectToken} from '../github-helpers/github-token.js';
import {detectStackParents, type PrInfo} from '../helpers/detect-stacked-prs.js';
import observe from '../helpers/selector-observer.js';

type Pr = {
	link: HTMLAnchorElement;
	owner: string;
	repo: string;
	number: number;
};

type Entry = {info: PrInfo; pr: Pr};

const storagePrefix = 'rgh-stack-collapsed:';
const stackRootAttribute = 'rghStackRoot';

function storageKey(ownerRepo: string, rootNumber: number): string {
	return `${storagePrefix}${ownerRepo}:${rootNumber}`;
}

function isStackCollapsed(ownerRepo: string, rootNumber: number): boolean {
	return localStorage.getItem(storageKey(ownerRepo, rootNumber)) === '1';
}

function setStackCollapsed(ownerRepo: string, rootNumber: number, collapsed: boolean): void {
	const key = storageKey(ownerRepo, rootNumber);
	if (collapsed) {
		localStorage.setItem(key, '1');
	} else {
		localStorage.removeItem(key);
	}
}

function buildQuery(prsByRepo: Map<string, Pr[]>): string {
	return [...prsByRepo.values()].map(prs => {
		const {owner, repo} = prs[0];
		return `
			${api.escapeKey('repo', owner, repo)}: repository(owner: "${owner}", name: "${repo}") {
				${
					prs.map(pr => `
					${api.escapeKey('pr', pr.number)}: pullRequest(number: ${pr.number}) {
						number
						title
						baseRefName
						headRefName
					}
				`).join('\n')
				}
			}
		`;
	}).join('\n');
}

function findRow(prLink: HTMLAnchorElement): HTMLElement | undefined {
	const row = prLink.closest('.js-issue-row, li');
	return row instanceof HTMLElement ? row : undefined;
}

function colorForStack(rootNumber: number): string {
	const hue = Math.round((rootNumber * 137.508) % 360);
	return `hsl(${hue} 65% 45%)`;
}

function findChildRows(rootNumber: number): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>(`[data-rgh-stack-root="${rootNumber}"]`)];
}

function applyCollapsedState(rootNumber: number, collapsed: boolean): void {
	for (const child of findChildRows(rootNumber)) {
		child.classList.toggle('rgh-stack-hidden', collapsed);
	}
}

function syncChevron(chevron: HTMLButtonElement, collapsed: boolean): void {
	chevron.dataset.rghCollapsed = collapsed ? '1' : '';
	const oldIcon = chevron.querySelector('.octicon');
	if (oldIcon) {
		const NewIcon = collapsed ? ChevronRightIcon : ChevronDownIcon;
		const newIconElement = (<NewIcon/>) as unknown as Element;
		oldIcon.replaceWith(newIconElement);
	}
}

type ChevronContext = {
	rootRow: HTMLElement;
	ownerRepo: string;
	rootNumber: number;
	color: string;
	childCount: number;
};

function ensureChevron(context: ChevronContext): void {
	const {rootRow, ownerRepo, rootNumber, color, childCount} = context;
	const collapsed = isStackCollapsed(ownerRepo, rootNumber);
	let chevron = rootRow.querySelector<HTMLButtonElement>('.rgh-stack-chevron');

	if (chevron) {
		// Update count in case stack membership changed across renders
		const countSpan = chevron.querySelector('.rgh-stack-count');
		if (countSpan) {
			countSpan.textContent = `+${childCount}`;
		}
	} else {
		const titleLink = rootRow.querySelector<HTMLAnchorElement>('a[data-hovercard-type="pull_request"]');
		// The title link is what selector-observer matched to invoke us, so it always exists,
		// but its parent might not in some preview/legacy DOM variants.
		const titleParent = titleLink ? titleLink.parentElement : null;
		if (!titleParent) {
			return;
		}

		const newChevron = (
			<button
				type="button"
				className="rgh-stack-chevron"
				aria-label="Toggle stack visibility"
				style={{['--rgh-stack-color' as string]: color}}
			>
				<ChevronDownIcon/>
				<span className="rgh-stack-count">{`+${childCount}`}</span>
			</button>
		) as unknown as HTMLButtonElement;

		newChevron.addEventListener('click', event => {
			event.preventDefault();
			event.stopPropagation();
			const newCollapsed = newChevron.dataset.rghCollapsed !== '1';
			setStackCollapsed(ownerRepo, rootNumber, newCollapsed);
			syncChevron(newChevron, newCollapsed);
			applyCollapsedState(rootNumber, newCollapsed);
		});

		titleParent.prepend(newChevron);
		chevron = newChevron;
	}

	syncChevron(chevron, collapsed);
	applyCollapsedState(rootNumber, collapsed);
}

function buildByNumber(repoPrs: Pr[], repository: Record<string, PrInfo>): Map<number, Entry> {
	const byNumber = new Map<number, Entry>();
	for (const pr of repoPrs) {
		const info = repository[api.escapeKey('pr', pr.number)];
		byNumber.set(info.number, {info, pr});
	}

	return byNumber;
}

function reorderRows(members: number[], byNumber: Map<number, Entry>): void {
	for (let index = 1; index < members.length; index++) {
		const memberRow = findRow(byNumber.get(members[index])!.pr.link);
		const previousRow = findRow(byNumber.get(members[index - 1])!.pr.link);
		if (memberRow && previousRow && memberRow !== previousRow.nextElementSibling && previousRow.parentElement) {
			previousRow.parentElement.insertBefore(memberRow, previousRow.nextElementSibling);
		}
	}
}

type StackContext = {
	root: number;
	members: number[];
	byNumber: Map<number, Entry>;
	color: string;
	ownerRepo: string;
};

function applyStackStyling(context: StackContext): void {
	const {root, members, byNumber, color, ownerRepo} = context;

	for (const number_ of members) {
		const entry = byNumber.get(number_)!;
		const row = findRow(entry.pr.link);
		if (!row) {
			continue;
		}

		row.classList.add('rgh-stack');
		row.style.setProperty('--rgh-stack-color', color);

		if (number_ === root) {
			row.classList.add('rgh-stack-root');
			row.classList.remove('rgh-stack-child', 'rgh-stack-hidden');
			row.removeAttribute('data-rgh-stack-root');
		} else {
			row.classList.add('rgh-stack-child');
			row.classList.remove('rgh-stack-root');
			row.dataset[stackRootAttribute] = String(root);
		}
	}

	const rootEntry = byNumber.get(root);
	if (!rootEntry) {
		return;
	}

	const rootRow = findRow(rootEntry.pr.link);
	if (rootRow) {
		ensureChevron({
			rootRow,
			ownerRepo,
			rootNumber: root,
			color,
			childCount: members.length - 1,
		});
	}
}

function processRepoStacks(repoPrs: Pr[], repository: Record<string, PrInfo>, ownerRepo: string): void {
	const byNumber = buildByNumber(repoPrs, repository);
	const parents = detectStackParents([...byNumber.values()].map(entry => entry.info));
	if (parents.size === 0) {
		return;
	}

	const inStack = new Set<number>();
	for (const [child, parent] of parents) {
		inStack.add(child);
		inStack.add(parent);
	}

	const depthCache = new Map<number, number>();
	const depthOf = (number_: number): number => {
		if (depthCache.has(number_)) {
			return depthCache.get(number_)!;
		}

		const p = parents.get(number_);
		const d = p === undefined ? 0 : depthOf(p) + 1;
		depthCache.set(number_, d);
		return d;
	};

	const rootCache = new Map<number, number>();
	const rootOf = (number_: number): number => {
		if (rootCache.has(number_)) {
			return rootCache.get(number_)!;
		}

		const p = parents.get(number_);
		const r = p === undefined ? number_ : rootOf(p);
		rootCache.set(number_, r);
		return r;
	};

	const groups = new Map<number, number[]>();
	for (const number_ of inStack) {
		const root = rootOf(number_);
		let group = groups.get(root);
		if (!group) {
			group = [];
			groups.set(root, group);
		}

		group.push(number_);
	}

	for (const [root, members] of groups) {
		members.sort((a, b) => depthOf(a) - depthOf(b) || a - b);
		const color = colorForStack(root);
		reorderRows(members, byNumber);
		applyStackStyling({
			root, members, byNumber, color, ownerRepo,
		});
	}
}

async function add(prLinks: HTMLAnchorElement[]): Promise<void> {
	const prs = new Set<Pr>();
	for (const link of prLinks) {
		const [, owner, repo, , number] = link.pathname.split('/');
		prs.add({
			link,
			owner,
			repo,
			number: Number(number),
		});
	}

	const prsByRepo = Map.groupBy(prs, pr => `${pr.owner}/${pr.repo}`);
	const data = await api.v4(buildQuery(prsByRepo));

	for (const repoPrs of prsByRepo.values()) {
		const {owner, repo} = repoPrs[0];
		const ownerRepo = `${owner}/${repo}`;
		const repository = data[api.escapeKey('repo', owner, repo)] as Record<string, PrInfo>;
		processRepoStacks(repoPrs, repository, ownerRepo);
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	observe(
		[
			'.js-issue-row a[data-hovercard-type="pull_request"]', // Repo and global PR lists
			'a[data-hovercard-type="pull_request"][data-testid="listitem-title-link"]', // Preview global PR list
			'a[data-hovercard-type="pull_request"][data-testid="issue-pr-title-link"]', // Issue list
		],
		batchedFunction(add, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Stable demo with a 4-PR stack: https://github.com/giovaborgogno/stacked-prs-demo/pulls
- Repo PR list (any repo with a stack): https://github.com/refined-github/sandbox/pulls
- Global PR list: https://github.com/pulls

The demo repo has four PRs forming a linear stack (#1 ← #2 ← #3 ← #4), where each PR's base branch is the previous PR's head branch.

*/
