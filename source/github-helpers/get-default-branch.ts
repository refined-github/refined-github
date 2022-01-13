import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import * as api from './api';
import {getRepo, getCurrentBranchFromFeed} from '.';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

const getDefaultBranch = cache.function(async function (repository?: pageDetect.RepositoryInfo): Promise<string> {
	if (arguments.length === 0) {
		repository = getRepo();
	}

	if (!repository) {
		throw new Error('getDefaultBranch was called on a non-repository page');
	}

	if (arguments.length === 0 || JSON.stringify(repository) === JSON.stringify(getRepo())) {
		if (pageDetect.isRepoHome()) {
			const branchSelector = await elementReady('[data-hotkey="w"]');

			if (branchSelector) {
				if (branchSelector.title === 'Switch branches or tags') {
					return branchSelector.textContent!.trim();
				} else {
					return branchSelector.title;
				}
			}

			console.error(`Could not find the branch selector. Calling API to get the default branch of ${repository.nameWithOwner}.`);
		}

		const defaultBranch = getCurrentBranchFromFeed();
		if (defaultBranch) {
			return defaultBranch;
		}

		if (!pageDetect.isForkedRepo()) {
			// We can find the name in the infobar, available in folder views
			const branchInfo = select('.branch-infobar')?.textContent!.trim();
			const defaultBranch = branchInfoRegex.exec(branchInfo!)?.[1];
			if (defaultBranch) {
				return defaultBranch;
			}
		}
	}

	const response = await api.v4(`
		repository(owner: "${repository.owner}", name: "${repository.name}") {
			defaultBranchRef {
				name
			}
		}
	`);

	return response.repository.defaultBranchRef.name;
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: ([repository = getRepo()]) => 'default-branch:' + repository!.nameWithOwner,
});

export default getDefaultBranch;
