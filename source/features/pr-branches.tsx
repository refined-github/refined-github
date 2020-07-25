import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import PullRequestIcon from 'octicon/git-pull-request.svg';

import features from '.';
import * as api from '../github-helpers/api';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo, getRepoGQL} from '../github-helpers';

type BranchInfo = {
	baseRef: string;
	baseRefName: string;
};

function buildQuery(issueIds: string[]): string {
	return `
		repository(${getRepoGQL()}) {
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

	const currentRepository = getRepositoryInfo();
	const query = buildQuery(prLinks.map(pr => pr.id));
	const [data, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch()
	]);

	for (const prLink of prLinks) {
		const pr: BranchInfo = data.repository[prLink.id];
		if (pr.baseRefName === defaultBranch || !pr.headOwner) { // 👻 @ghost user
			continue;
		}

		const branch = pr.baseRef && `/${currentRepository.owner!}/${currentRepository.name!}/tree/${pr.baseRefName}`;

		prLink.parentElement!.querySelector('.text-small.text-gray')!.append(
			<span className="issue-meta-section d-inline-block">
				<PullRequestIcon/>
				{' To '}
				<span
					className="commit-ref css-truncate user-select-contain mb-n1"
					style={(branch ? {} : {textDecoration: 'line-through'})}
				>
					<a title={branch ? pr.baseRefName : 'Deleted'} href={branch}>
						{pr.baseRefName}
					</a>
				</span>
			</span>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Shows head and base branches in PR lists if they’re significant: The base branch is added when it’s not the repo’s default branch; The head branch is added when it’s from the same repo or the PR is by the current user.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51428391-ae9ed500-1c35-11e9-8e54-6b6a424fede4.png'
}, {
	include: [
		pageDetect.isRepoConversationList
	],
	init
});
