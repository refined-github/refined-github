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

type BaseBranch = {
	ref: string;
	refName: string;
};

type Pr = {
	link: HTMLAnchorElement;
	owner: string;
	repo: string;
	number: number;
};

function isClosed(prLink: HTMLElement): boolean {
	const row = prLink.closest([
		'.js-issue-row', // Legacy DOM
		'li',
	])!;
	return elementExists([
		// Legacy DOM
		'.octicon.merged',
		'.octicon.closed',
		// React DOM
		'.octicon-git-merge',
		'.octicon-git-pull-request-closed',
	], row);
}

function buildQuery(prsByRepo: Map<string, Pr[]>): string {
	return [...prsByRepo.values()].map(prs => {
		const {owner, repo} = prs[0];
		return `
			${api.escapeKey('repo', owner, repo)}: repository(owner: "${owner}", name: "${repo}") {
				nameWithOwner
				defaultBranchRef {name}
				${prs.map(pr => `
					${api.escapeKey('pr', pr.number)}: pullRequest(number: ${pr.number}) {
						ref: baseRef {id}
						refName: baseRefName
					}
				`).join('\n')}
			}
		`;
	}).join('\n');
}

function renderBranches(pr: Pr, baseBranch: BaseBranch, nameWithOwner: string): void {
	const branch = baseBranch.ref && `/${nameWithOwner}/tree/${baseBranch.refName}`;
	const displayName = abbreviateString(baseBranch.refName, 25);

	const badge = (
		<span className="ml-2">
			<GitPullRequestIcon />
			{' To '}
			<span
				className="commit-ref user-select-contain mb-n1"
				style={branch ? {} : {textDecoration: 'line-through'}}
			>
				<a title={branch ? baseBranch.refName : 'Deleted'} href={branch}>
					{displayName}
				</a>
			</span>
		</span>
	);

	const metadataRow = pr.link.matches('.js-navigation-open')
		? pr.link.parentElement!.querySelector('.text-small.color-fg-muted .d-none.d-md-inline-flex')!
		: pr.link.closest('li')!.querySelector([
			'div[data-testid="list-row-repo-name-and-number"]',
			'div[class^="Description"]'
		])!;
	metadataRow.append(badge);
}

async function add(prLinks: HTMLAnchorElement[]): Promise<void> {
	const prs = new Set<Pr>();
	for (const link of prLinks) {
		const [, owner, repo, , number] = link.pathname.split('/');
		prs.add({
			link, owner, repo, number: Number(number),
		});
	}

	const prsByRepo = Map.groupBy(prs, pr => `${pr.owner}/${pr.repo}`);
	const data = await api.v4(buildQuery(prsByRepo));

	for (const repoPrs of prsByRepo.values()) {
		const {owner, repo} = repoPrs[0];
		const repository = data[api.escapeKey('repo', owner, repo)];
		if (!repository) {
			continue;
		}

		const defaultBranch = repository.defaultBranchRef?.name;
		for (const pr of repoPrs) {
			const baseBranch: BaseBranch = repository[api.escapeKey('pr', pr.number)];
			if (baseBranch.refName === defaultBranch) {
				continue;
			}

			// Avoid noise on old PRs pointing to `master` #3910
			// If the PR is open, it means that `master` still exists
			if (baseBranch.refName === 'master' && isClosed(pr.link)) {
				continue;
			}

			renderBranches(pr, baseBranch, repository.nameWithOwner);
		}
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	observe([
		'.js-issue-row .js-navigation-open[data-hovercard-type="pull_request"]', // Repo and global PR lists
		'a[data-testid="listitem-title-link"][data-hovercard-type="pull_request"]', // Preview global PR list
		'a[data-testid="issue-pr-title-link"][data-hovercard-type="pull_request"]', // Issue list
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
- Global issue list: https://github.com/issues?q=is%3Aopen+is%3Apr+repo%3Arefined-github%2Fsandbox+pr+branch

*/
