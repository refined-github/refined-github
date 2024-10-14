import {CachedFunction} from 'webext-storage-cache';
import {hasToken} from '../options-storage.js';
import {getRepo} from './index.js';
import api from './api.js';

/*
From https://docs.github.com/en/graphql/reference/enums#repositorypermission

ADMIN: Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.

MAINTAIN: Can read, clone, and push to this repository. They can also manage issues, pull requests, and some repository settings.

READ: Can read and clone this repository. Can also open and comment on issues and pull requests.

TRIAGE: Can read and clone this repository. Can also manage issues and pull requests.

WRITE: Can read, clone, and push to this repository. Can also manage issues and pull requests.
*/
type RepositoryPermission = 'ADMIN' | 'MAINTAIN' | 'READ' | 'TRIAGE' | 'WRITE';

async function getViewerPermission(): Promise<RepositoryPermission> {
	if (!hasToken()) {
		return 'READ';
	}

	try {
		const {repository} = await api.v4(`
			repository() {
				viewerPermission
			}
		`);

		return repository.viewerPermission;
	} catch {
		return 'READ';
	}
}

const viewerPermission = new CachedFunction('viewer-permission', {
	updater: getViewerPermission,
	cacheKey: () => getRepo()?.nameWithOwner ?? '',
});

export async function userIsAdmin(): Promise<boolean> {
	const repoAccess = await viewerPermission.get();
	return repoAccess === 'ADMIN';
}

/** Check if the user has complete write access to the repo (but no access to the repo Settings) */
export async function userHasPushAccess(): Promise<boolean> {
	const repoAccess = await viewerPermission.get();
	return repoAccess !== 'READ' && repoAccess !== 'TRIAGE';
}

/** Check if the user can edit all comments and comment on locked issues on the current repo */
export async function userIsModerator(): Promise<boolean> {
	const repoAccess = await viewerPermission.get();
	return repoAccess !== 'READ';
}
