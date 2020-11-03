import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import PullRequestIcon from 'octicon/git-pull-request.svg';

import features from '.';
import * as api from '../github-helpers/api';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepoGQL, buildRepoURL} from '../github-helpers';

interface BranchInfo {
	baseRef: string;
	baseRefName: string;
}

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

	const query = buildQuery(prLinks.map(pr => pr.id));
	const [data, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch()
	]);

	for (const prLink of prLinks) {
		const pr: BranchInfo = data.repository[prLink.id];
		if (pr.baseRefName === defaultBranch) {
			continue;
		}

		const branch = pr.baseRef && buildRepoURL(`tree/${pr.baseRefName}`);

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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoConversationList
	],
	init
});
