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
	const {repository} = await api.v4uncached(`
		repository() {
			viewerPermission
		}
	`);

	return repository.viewerPermission;
}

export async function userHasPushAccess(): Promise<boolean> {
	const repoAccess = await getViewerPermission();
	return repoAccess !== 'READ' && repoAccess !== 'TRIAGE';
}

export async function userIsModerator(): Promise<boolean> {
	const repoAccess = await getViewerPermission();
	return repoAccess !== 'READ';
}
