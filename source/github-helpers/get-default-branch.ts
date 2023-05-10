/* eslint-disable @typescript-eslint/prefer-nullish-coalescing -- Wrong, the type is `false | undefined` */
import cache from 'webext-storage-cache';
import elementReady from 'element-ready';
import {type RepositoryInfo} from 'github-url-detection';

import * as api from './api.js';
import {getRepo} from './index.js';
import {branchSelector} from './selectors.js';

const typesWithRefSelector = new Set(['tree', 'blob', 'blame', 'compare']);

const isCurrentRepo = ({nameWithOwner}: RepositoryInfo): boolean => Boolean(getRepo()?.nameWithOwner === nameWithOwner);

async function fromDOM(): Promise<string | undefined> {
	if (['', 'commits'].includes(getRepo()!.path)) {
		// We're on the default branch, so we can extract it from the current page. This exclusively happens on the exact pages:
		// /user/repo
		// /user/repo/commits (without further path)
		const branchPicker = await elementReady(branchSelector);
		if (branchPicker) {
			return branchPicker.textContent!.trim();
		}
	}

	// Use explicit list to avoid uselessly waiting for the the `ref-selector` to appear
	const type = location.pathname.split('/')[3];
	if (typesWithRefSelector.has(type)) {
		const branchPicker = await elementReady('ref-selector', {waitForChildren: false});
		if (branchPicker) {
			return branchPicker.getAttribute('default-branch')!;
		}
	}

	return undefined;
}

async function fromAPI(repository: RepositoryInfo): Promise<string> {
	const response = await api.v4(`
		repository(owner: "${repository.owner}", name: "${repository.name}") {
			defaultBranchRef {
				name
			}
		}
	`);

	return response.repository.defaultBranchRef.name;
}

// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
const _getDefaultBranch = cache.function('default-branch',
	async (repository: RepositoryInfo): Promise<string> => (isCurrentRepo(repository) && await fromDOM()) || fromAPI(repository),
	{
		maxAge: {hours: 1},
		staleWhileRevalidate: {days: 20},
		cacheKey: ([repository]) => repository.nameWithOwner,
	},
);

export default async function getDefaultBranch(repository: RepositoryInfo | undefined = getRepo()): Promise<string> {
	if (!repository) {
		throw new Error('getDefaultBranch was called on a non-repository page');
	}

	return _getDefaultBranch(repository);
}
