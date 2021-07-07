import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import {buildRepoURL} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';

interface BranchInfo {
	baseRef: string;
	baseRefName: string;
}

function isClosed(prLink: HTMLElement): boolean {
	return Boolean(prLink.closest('.js-issue-row')!.querySelector('.octicon.merged, .octicon.closed'));
}

function buildQuery(issueIds: string[]): string {
	return `
		repository() {
			${issueIds.map(id => `
				${id}: pullRequest(number: ${id.replace(/\D/g, '')}) {
					baseRef {id}
					baseRefName
				}
			`).join('\n')}
		}
	`;
}

async function init(): Promise<false | void> {
	const prLinks = select.all('.js-issue-row .js-navigation-open[data-hovercard-type="pull_request"]');
	if (prLinks.length === 0) {
		return false;
	}

	const query = buildQuery(prLinks.map(pr => pr.id));
	const [data, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch(),
	]);

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

		const branch = pr.baseRef && buildRepoURL(`tree/${pr.baseRefName}`);

		prLink.parentElement!.querySelector('.text-small.color-text-secondary, .text-small.text-gray')!.append(
			<span className="issue-meta-section d-inline-block">
				<GitPullRequestIcon/>
				{' To '}
				<span
					className="commit-ref css-truncate user-select-contain mb-n1"
					style={(branch ? {} : {textDecoration: 'line-through'})}
				>
					<a title={branch ? pr.baseRefName : 'Deleted'} href={branch}>
						{pr.baseRefName}
					</a>
				</span>
			</span>,
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList,
	],
	init,
});
