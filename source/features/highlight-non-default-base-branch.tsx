import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';
import abbreviateString from '../helpers/abbreviate-string.js';

type BranchInfo = {
	baseRef: string;
	baseRefName: string;
};

function isClosed(prLink: HTMLElement): boolean {
	return Boolean(prLink.closest('.js-issue-row')!.querySelector(['.octicon.merged', '.octicon.closed']));
}

function buildQuery(issueIds: string[]): string {
	return `
		repository() {
			nameWithOwner
			defaultBranchRef {name}
			${issueIds.map(id => `
				${id}: pullRequest(number: ${id.replaceAll(/\D/g, '')}) {
					baseRef {id}
					baseRefName
				}
			`).join('\n')}
		}
	`;
}

async function add(prLinks: HTMLElement[]): Promise<void> {
	const query = buildQuery(prLinks.map(pr => pr.id));
	const data = await api.v4(query);
	const defaultBranch = data.repository.defaultBranchRef?.name;

	for (const prLink of prLinks) {
		const pr: BranchInfo = data.repository[prLink.id];
		if (pr.baseRefName === defaultBranch) {
			continue;
		}

		// Avoid noise on old PRs pointing to `master` #3910
		// If the PR is open, it means that `master` still exists
		if (pr.baseRefName === 'master' && isClosed(prLink)) {
			continue;
		}

		const branch = pr.baseRef && `/${data.repository.nameWithOwner}/tree/${pr.baseRefName}`;
		const displayName = abbreviateString(pr.baseRefName, 25);

		prLink.parentElement!.querySelector('.text-small.color-fg-muted .d-none.d-md-inline-flex')!.append(
			<span className="issue-meta-section ml-2">
				<GitPullRequestIcon />
				{' To '}
				<span
					className="commit-ref user-select-contain mb-n1"
					style={branch ? {} : {textDecoration: 'line-through'}}
				>
					<a title={branch ? pr.baseRefName : 'Deleted'} href={branch}>
						{displayName}
					</a>
				</span>
			</span>,
		);
	}
}

async function init(signal: AbortSignal): Promise<false | void> {
	await expectToken();
	observe('.js-issue-row .js-navigation-open[data-hovercard-type="pull_request"]', batchedFunction(add, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueOrPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pulls?q=is%3Apr+is%3Aopen+pr+branch

*/
