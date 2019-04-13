import * as api from './api';

export async function createBranch(ownerName, repoName, slug, branchFromThisSHA) {
	await api.v3({
		query: `repos/${ownerName}/${repoName}/git/refs`,
		method: 'POST',
		body: {
			ref: `refs/heads/${slug}`,
			sha: branchFromThisSHA
		}
	});
}
