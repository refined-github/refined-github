import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from './api';
import {getRepoURL, getRepoGQL} from './utils';

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
	const branchInfo = select('.branch-infobar')?.textContent?.trim();
	return branchInfoRegex.exec(branchInfo!)?.[1];
}

async function fetchFromApi(): Promise<string> {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			defaultBranchRef {
				name
			}
		}
	`);

	return repository.defaultBranchRef.name;
}

export default cache.function(async () => parseBranchFromDom() ?? fetchFromApi(), {
	cacheKey: () => 'default-branch:' + getRepoURL()
});
