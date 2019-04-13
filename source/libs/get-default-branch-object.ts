import * as cache from './cache';
import * as api from './api';
import getDefaultBranch from './get-default-branch';

export async function getDefaultBranchObject(ownerName, repoName) {
	return cache.getSet(`default-branch-object:${ownerName}/${repoName}`,
		async () => (await api.v3(`repos/${ownerName}/${repoName}/git/refs/heads/${await getDefaultBranch()}`)).object
	);
}
