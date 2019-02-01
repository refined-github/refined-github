import select from 'select-dom';
import * as cache from './cache';
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
	const [, branchName] = branchInfo.textContent.trim().match(branchInfoRegex) || [undefined, undefined];
	return branchName;
}

async function fetchFromApi(user: string, repo: string) {
	const response = await api.v3<{default_branch:string}>(`repos/${user}/${repo}`);
	if (response && response.default_branch) {
		return response.default_branch;
	}
}

export default function () {
	const {ownerName, repoName} = getOwnerAndRepo();
	return cache.getSet(`default-branch:${ownerName}/${repoName}`,
		() => parseBranchFromDom() || fetchFromApi(ownerName, repoName)
	);
}
