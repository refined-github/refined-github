import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from './api';
import {getRepoURL} from './utils';

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
	const matches = branchInfoRegex.exec(branchInfo.textContent!.trim());
	return matches ? matches[1] : undefined;
}

async function fetchFromApi(): Promise<string> {
	const response = await api.v3(`repos/${getRepoURL()}`);
	return response.default_branch as string;
}

export default async function (): Promise<string> {
	const cached = await cache.get<string>(`default-branch:${getRepoURL()}`);
	if (cached) {
		return cached;
	}

	const branch = parseBranchFromDom() || await fetchFromApi();
	await cache.set(`default-branch:${getRepoURL()}`, branch, 1);
	return branch;
}
