import * as cache from './cache';
import * as api from './api';
import {getOwnerAndRepo} from './page-detect';

async function fetchFromApi(user, repo) {
	const response = await api.v3(`repos/${user}/${repo}`);
	if (response && response.default_branch) {
		return response.default_branch;
	}
}

export default function () {
	const {ownerName, repoName} = getOwnerAndRepo();
	return cache.getSet(`default-branch:${ownerName}/${repoName}`,
		() => fetchFromApi(ownerName, repoName)
	);
}
