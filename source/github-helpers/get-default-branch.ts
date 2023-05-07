import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import * as api from './api.js';
import {getRepo} from './index.js';
import {branchSelector} from './selectors.js';

const isCurrentRepo = ({nameWithOwner}: pageDetect.RepositoryInfo): boolean => Boolean(getRepo()?.nameWithOwner === nameWithOwner);

// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
const _getDefaultBranch = cache.function('default-branch', async (repository: pageDetect.RepositoryInfo): Promise<string> => {
	if (isCurrentRepo(repository) && ['', 'commits'].includes(repository.path)) {
		// We're on the default branch, so we can extract it from the current page. This usually happens on the pages:
		// @example /user/repo
		// @example /user/repo/commits (without further path)
		const branchPicker = await elementReady(branchSelector);
		if (branchPicker) {
			return branchPicker.textContent!.trim();
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
