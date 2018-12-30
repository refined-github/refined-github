import {h} from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/page-detect';
import getDefaultBranch from '../libs/get-default-branch';

function normalizeBranchInfo(data) {
	const {ownerName, repoName} = getOwnerAndRepo();

	const base = {};
	base.branchExists = Boolean(data.baseRef);
	base.label = data.baseRefName;
	if (base.branchExists) {
		base.url = `/${ownerName}/${repoName}/tree/${data.baseRefName}`;
	}

	const head = {};
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
			class="commit-ref css-truncate user-select-contain"
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

export default async function () {
	const {ownerName} = getOwnerAndRepo();
	const elements = select.all('.js-issue-row');
	const query = buildQuery(elements.map(pr => pr.id));
	const [info, defaultBranch] = await Promise.all([
		api.v4(query),
		getDefaultBranch()
	]);

	for (const PR of elements) {
		const {base, head} = normalizeBranchInfo(info.data.repository[PR.id]);

		if (base.label === defaultBranch) {
			continue;
		}

		let branches;
		if (head.owner === ownerName) {
			branches = <>From {createLink(head)} into {createLink(base)}</>;
		} else {
			branches = <>To {createLink(base)}</>;
		}
		select('.col-9.lh-condensed', PR).append(
			<div class="mt-1 text-small text-gray">{branches}</div>
		);
	}
}
