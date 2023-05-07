import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import * as api from './api.js';
import {getRepo, getCurrentBranchFromFeed} from './index.js';
import {branchSelector} from './selectors.js';

const isCurrentRepo = ({nameWithOwner}: pageDetect.RepositoryInfo): boolean => Boolean(getRepo()?.nameWithOwner === nameWithOwner);

// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
const _getDefaultBranch = cache.function('default-branch', async (repository: pageDetect.RepositoryInfo): Promise<string> => {
	if (isCurrentRepo(repository)) {
		if (pageDetect.isRepoHome()) {
			const branchPicker = await elementReady(branchSelector);
			if (branchPicker) {
				return branchPicker.title === 'Switch branches or tags'
					? branchPicker.textContent!.trim()
					: branchPicker.title;
			}
		}

		if (pageDetect.isRepoCommitList()) {
			return getCurrentBranchFromFeed()!;
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
