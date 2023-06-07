import {UpdatableCacheItem} from 'webext-storage-cache';
import elementReady from 'element-ready';
import {type RepositoryInfo} from 'github-url-detection';

import api from './api.js';
import {extractCurrentBranchFromBranchPicker, getRepo} from './index.js';
import {branchSelector} from './selectors.js';

const isCurrentRepo = ({nameWithOwner}: RepositoryInfo): boolean => Boolean(getRepo()?.nameWithOwner === nameWithOwner);

// Do not make this function complicated. We're only optimizing for the repo root.
async function fromDOM(): Promise<string | undefined> {
	if (!['', 'commits'].includes(getRepo()!.path)) {
		return undefined;
	}

	// We're on the default branch, so we can extract it from the current page. This exclusively happens on the exact pages:
	// /user/repo
	// /user/repo/commits (without further path)
	return extractCurrentBranchFromBranchPicker((await elementReady(branchSelector))!);
}

async function fromAPI(repository: RepositoryInfo): Promise<string> {
	const response = await api.v4(`
		query getDefaultBranch($owner: String!, $name: String!) {
			repository(owner: $owner, name: $name) {
				defaultBranchRef {
					name
				}
			}
		}
	`, {
		variables: {
			owner: repository.owner,
			name: repository.name,
		},
	});

	return response.repository.defaultBranchRef.name;
}

// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
export const getDefaultBranchOfRepo = new UpdatableCacheItem('default-branch', {
	async updater(repository: RepositoryInfo): Promise<string> {
		if (!repository) {
			throw new Error('getDefaultBranch was called on a non-repository page');
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Wrong, the type is `false | undefined`
		return (isCurrentRepo(repository) && await fromDOM()) || fromAPI(repository);
	},

	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: ([repository]) => repository.nameWithOwner,
},
);

export default async function getDefaultBranch(): Promise<string> {
	return getDefaultBranchOfRepo.get(getRepo()!);
}
