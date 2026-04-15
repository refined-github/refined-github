import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import batchedFunction from 'batched-function';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';
import abbreviateString from '../helpers/abbreviate-string.js';

type BranchInfo = {
	baseRef: string;
	baseRefName: string;
};

type PrRef = {
	link: HTMLAnchorElement;
	owner: string;
	repo: string;
	number: number;
};

const closedSelectors = [
	'.octicon.merged', // Legacy DOM
	'.octicon.closed', // Legacy DOM
	'.octicon-git-merge', // React DOM
	'.octicon-git-pull-request-closed', // React DOM
];

function isClosed(prLink: HTMLElement): boolean {
	const row = prLink.closest([
		'.js-issue-row', // Legacy DOM
		'[class^="IssueRow"]', // React DOM
	]);
	return elementExists(closedSelectors, row!);
}

function buildQuery(groups: Map<string, PrRef[]>): string {
	return [...groups.values()].map(prs => {
		const {owner, repo} = prs[0];
		return `
			${api.escapeKey('repo', owner, repo)}: repository(owner: "${owner}", name: "${repo}") {
				nameWithOwner
				defaultBranchRef {name}
				${prs.map(pr => `
					${api.escapeKey('pr', pr.number)}: pullRequest(number: ${pr.number}) {
						baseRef {id}
						baseRefName
					}
				`).join('\n')}
			}
		`;
	}).join('\n');
}

function renderBadge(pr: PrRef, info: BranchInfo, nameWithOwner: string): void {
	const branch = info.baseRef && `/${nameWithOwner}/tree/${info.baseRefName}`;
	const displayName = abbreviateString(info.baseRefName, 25);

	const badge = (
		<span className="issue-meta-section ml-2">
			<GitPullRequestIcon />
			{' To '}
			<span
				className="commit-ref user-select-contain mb-n1"
				style={branch ? {} : {textDecoration: 'line-through'}}
			>
				<a title={branch ? info.baseRefName : 'Deleted'} href={branch}>
					{displayName}
				</a>
			</span>
		</span>
	);

	// Legacy DOM exposes a dedicated metadata container; React rows (global list) don't, so place next to the title link
	const legacyMeta = pr.link.parentElement?.querySelector('.text-small.color-fg-muted .d-none.d-md-inline-flex');
	if (legacyMeta) {
		legacyMeta.append(badge);
	} else {
		pr.link.after(badge);
	}
}

async function add(prLinks: HTMLAnchorElement[]): Promise<void> {
	const groups = new Map<string, PrRef[]>();
	for (const link of prLinks) {
		const [, owner, repo, , number] = link.pathname.split('/');
		const ref: PrRef = {
			link, owner, repo, number: Number(number),
		};
		const key = `${owner}/${repo}`;
		const list = groups.get(key) ?? [];
		list.push(ref);
		groups.set(key, list);
	}

	const data = await api.v4(buildQuery(groups));

	for (const prs of groups.values()) {
		const {owner, repo} = prs[0];
		const repository = data[api.escapeKey('repo', owner, repo)];
		if (!repository) {
			continue;
		}

		const defaultBranch = repository.defaultBranchRef?.name;
		for (const pr of prs) {
			const info: BranchInfo = repository[api.escapeKey('pr', pr.number)];
			if (info.baseRefName === defaultBranch) {
				continue;
			}

			// Avoid noise on old PRs pointing to `master` #3910
			// If the PR is open, it means that `master` still exists
			if (info.baseRefName === 'master' && isClosed(pr.link)) {
				continue;
			}

			renderBadge(pr, info, repository.nameWithOwner);
		}
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	observe([
		'.js-issue-row .js-navigation-open[data-hovercard-type="pull_request"]', // Per-repo issue/PR list
		'a[data-testid="issue-pr-title-link"][href*="/pull/"]', // Global PR list (React row)
	], batchedFunction(add, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Repo PR list: https://github.com/refined-github/sandbox/pulls?q=is%3Apr+is%3Aopen+pr+branch
- Repo issue list: https://github.com/refined-github/sandbox/issues?q=is%3Apr%20state%3Aopen+pr+branch
- Global PR list: https://github.com/pulls?q=is%3Aopen+is%3Apr+repo%3Arefined-github%2Fsandbox+pr+branch

*/
