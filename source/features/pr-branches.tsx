/*
Head and base branches are added to the PR list when they are significant.

The base branch is added when it's not the repo's default branch.
The head branch is added when it's from the same repo or the PR is by the current user.
*/

import {React} from 'dom-chef/react';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import getDefaultBranch from '../libs/get-default-branch';
import {getOwnerAndRepo} from '../libs/utils';
import {openPullRequest} from '../libs/icons';

function normalizeBranchInfo(data) {
	const {ownerName, repoName} = getOwnerAndRepo();

	const base: AnyObject = {};
	base.branchExists = Boolean(data.baseRef);
	base.label = data.baseRefName;
	if (base.branchExists) {
		base.url = `/${ownerName}/${repoName}/tree/${data.baseRefName}`;
	}

	const head: AnyObject = {};
	head.branchExists = Boolean(data.headRef);
	head.owner = data.headOwner.login;
	if (!data.headOwner || data.headOwner.login === ownerName) {
		head.label = data.headRefName;
	} else {
		head.label = `${data.headOwner.login}:${data.headRefName}`;
	}

	if (head.branchExists) { // If the branch hasn't been deleted
		head.url = `${data.headRepository.url}/tree/${data.headRefName}`;
	} else if (data.headRepository) { // If the repo hasn't been deleted
		head.url = data.headRepository.url;
	}

	return {base, head};
}

function buildQuery(numbers) {
	const {ownerName, repoName} = getOwnerAndRepo();

	return `{
		repository(owner: "${ownerName}", name: "${repoName}") {
			${numbers.map(number => `
				${number}: pullRequest(number: ${number.replace('issue_', '')}) {
					baseRef {id}
					headRef {id}
					baseRefName
					headRefName
					headRepository {url}
					headOwner: headRepositoryOwner {login}
				}
			`)}
		}
	}`;
}

function createLink(ref) {
	return (
		<span
			class="commit-ref css-truncate user-select-contain mb-n1"
			style={(ref.branchExists ? {} : {'text-decoration': 'line-through'})}>
			{
				ref.url ?
					<a title={(ref.branchExists ? ref.label : 'Deleted')} href={ref.url}>
						{ref.label}
					</a> :
					<span class="unknown-repo">unknown repository</span>
			}
		</span>
	);
}

async function init() {
	const {ownerName} = getOwnerAndRepo();
	const elements = select.all('.js-issue-row');
	const query = buildQuery(elements.map(pr => pr.id));
	const [data, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch()
	]);

	for (const PR of elements) {
		let branches;
		let {base, head} = normalizeBranchInfo(data.repository[PR.id]);

		if (base.label === defaultBranch) {
			base = null;
		}

		if (head.owner !== ownerName) {
			head = null;
		}

		if (base && head) {
			branches = <>From {createLink(head)} into {createLink(base)}</>;
		} else if (head) {
			branches = <>From {createLink(head)}</>;
		} else if (base) {
			branches = <>To {createLink(base)}</>;
		} else {
			continue;
		}

		select('.text-small.text-gray', PR).append(
			<span class="issue-meta-section">
				{openPullRequest()}
				{' '}
				{branches}
			</span>
		);
	}
}

features.add({
	id: 'pr-branches',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
