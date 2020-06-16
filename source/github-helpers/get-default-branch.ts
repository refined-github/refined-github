import cache from 'webext-storage-cache';
import select from 'select-dom';
import {isForkedRepo} from 'github-url-detection/esm';

import * as api from './api';
import {RepositoryInfo, getCurrentRepository, getRepoURL} from '.';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

export default cache.function(async (repository: Partial<RepositoryInfo> = getCurrentRepository()): Promise<string> => {
	if (JSON.stringify(repository) === JSON.stringify(getCurrentRepository())) {
		if (!isForkedRepo()) {
			// We can find the name in the infobar, available in folder views
			const branchInfo = select('.branch-infobar')?.textContent!.trim();
			const defaultBranch = branchInfoRegex.exec(branchInfo!)?.[1];
			if (defaultBranch) {
				return defaultBranch;
			}
		}
	}

	const response = await api.v4(`
		repository(owner: "${repository.owner!}", name: "${repository.name!}") {
			defaultBranchRef {
				name
			}
		}
	`);

	return response.repository.defaultBranchRef.name;
}, {
	maxAge: 10,
	staleWhileRevalidate: 20,
	cacheKey: ([repository]) => repository ? `default-branch:${repository.owner!}/${repository.name!}` : `default-branch:${getRepoURL()}`
});
