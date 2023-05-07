import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import * as api from './api.js';
import {getRepo, getCurrentBranchFromFeed} from './index.js';
import {branchSelector} from './selectors.js';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
const _getDefaultBranch = cache.function('default-branch', async function (repository: pageDetect.RepositoryInfo): Promise<string> {
	if (arguments.length === 0 || JSON.stringify(repository) === JSON.stringify(getRepo())) {
		if (pageDetect.isRepoHome()) {
			const branchPicker = await elementReady(branchSelector);
			if (branchPicker) {
				return branchPicker.title === 'Switch branches or tags'
					? branchPicker.textContent!.trim()
					: branchPicker.title;
			}
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
	cacheKey: ([repository]) => repository.nameWithOwner,
});

export default async function getDefaultBranch(repository: pageDetect.RepositoryInfo | undefined = getRepo()): Promise<string> {
	if (!repository) {
		throw new Error('getDefaultBranch was called on a non-repository page');
	}

	return _getDefaultBranch(repository);
}
