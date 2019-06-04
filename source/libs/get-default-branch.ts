import select from 'select-dom';
import cache from './cache';
import * as api from './api';
import {getOwnerAndRepo} from './utils';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

function parseBranchFromDom(): string | undefined {
	if (select.exists('.repohead h1 .octicon-repo-forked')) {
		return; // It's a fork, no "default branch" info available #1132
	}

	// We can find the name in the infobar, available in folder views
	const branchInfo = select('.branch-infobar');
	if (!branchInfo) {
		return;
	}

	// Parse the infobar
	const [, branchName = undefined] = branchInfo.textContent!.trim().match(branchInfoRegex) || [];
	return branchName; // `string` or undefined
}

async function fetchFromApi(user: string, repo: string): Promise<any> {
	const response = await api.v3(`repos/${user}/${repo}`);
	if (response.default_branch) {
		return response.default_branch;
	}
}

export default async function (): Promise<string> {
	const {ownerName, repoName} = getOwnerAndRepo();
	const cached = await cache.get<string>(`default-branch:${ownerName}/${repoName}`);
	if (cached) {
		return cached;
	}

	const branch = parseBranchFromDom() || await fetchFromApi(ownerName, repoName);
	await cache.set(`default-branch:${ownerName}/${repoName}`, branch, 1);
	return branch;
}
