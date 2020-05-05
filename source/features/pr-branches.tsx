import React from 'dom-chef';
import select from 'select-dom';
import PullRequestIcon from 'octicon/git-pull-request.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import getDefaultBranch from '../libs/get-default-branch';
import {getOwnerAndRepo, getRepoGQL} from '../libs/utils';

type RepositoryReference = {
	owner: string;
	branchExists: boolean;
	url?: string;
	label: string;
};

type BranchInfo = {
	baseRef: string;
	baseRefName: string;
	headRef: string;
	headOwner: {
		login: string;
	};
	headRefName: string;
	headRepository?: {
		url: string;
	};
};

function normalizeBranchInfo(data: BranchInfo): {
	base?: RepositoryReference;
	head?: RepositoryReference;
} {
	const {ownerName, repoName} = getOwnerAndRepo();

	const base = {} as RepositoryReference; // eslint-disable-line @typescript-eslint/consistent-type-assertions
	base.branchExists = Boolean(data.baseRef);
	base.label = data.baseRefName;
	if (base.branchExists) {
		base.url = `/${ownerName!}/${repoName!}/tree/${data.baseRefName}`;
	}

	const head = {} as RepositoryReference; // eslint-disable-line @typescript-eslint/consistent-type-assertions
	head.branchExists = Boolean(data.headRef);
	head.owner = data.headOwner.login;
	if (data.headOwner.login === ownerName) {
		head.label = data.headRefName;
	} else {
		head.label = `${data.headOwner.login}:${data.headRefName}`;
	}

	if (head.branchExists) { // If the branch hasn't been deleted
		head.url = `${data.headRepository!.url}/tree/${data.headRefName}`;
	} else if (data.headRepository) { // If the repo hasn't been deleted
		head.url = data.headRepository.url;
	}

	return {base, head};
}

function buildQuery(issueIds: string[]): string {
	return `
		repository(${getRepoGQL()}) {
			${issueIds.map(id => `
				${id}: pullRequest(number: ${id.replace(/\D/g, '')}) {
					baseRef {id}
					headRef {id}
					baseRefName
					headRefName
					headRepository {url}
					headOwner: headRepositoryOwner {login}
				}
			`).join('\n')}
		}
	`;
}

function createLink(reference: RepositoryReference): HTMLSpanElement {
	return (
		<span
			className="commit-ref css-truncate user-select-contain mb-n1"
			style={(reference.branchExists ? {} : {textDecoration: 'line-through'})}
		>
			{
				reference.url ?
					<a title={(reference.branchExists ? reference.label : 'Deleted')} href={reference.url}>
						{reference.label}
					</a> :
					<span className="unknown-repo">unknown repository</span>
			}
		</span>
	);
}

async function init(): Promise<false | void> {
	const prLinks = select.all('.js-issue-row .js-navigation-open[data-hovercard-type="pull_request"]');
	if (prLinks.length === 0) {
		return false;
	}

	const {ownerName} = getOwnerAndRepo();
	const query = buildQuery(prLinks.map(pr => pr.id));
	const [data, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch()
	]);

	for (const prLink of prLinks) {
		if (!data.repository[prLink.id].headOwner) { // 👻 @ghost user
			return;
		}

		let branches;
		let {base, head} = normalizeBranchInfo(data.repository[prLink.id]);

		if (base!.label === defaultBranch) {
			base = undefined;
		}

		if (head!.owner !== ownerName) {
			head = undefined;
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

		prLink.parentElement!.querySelector('.text-small.text-gray')!.append(
			<span className="issue-meta-section d-inline-block">
				<PullRequestIcon/> {branches}
			</span>
		);
	}
}

features.add({
	id: __filebasename,
	description: 'Shows head and base branches in PR lists if they’re significant: The base branch is added when it’s not the repo’s default branch; The head branch is added when it’s from the same repo or the PR is by the current user.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51428391-ae9ed500-1c35-11e9-8e54-6b6a424fede4.png'
}, {
	include: [
		pageDetect.isRepoDiscussionList
	],
	init
});
