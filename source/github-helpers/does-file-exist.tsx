import api from './api.js';
import GitHubURL from './github-url.js';
import DoesFileExist from './does-file-exist.gql';

export default async function doesFileExist(url: GitHubURL): Promise<boolean> {
	const {repository} = await api.v4(DoesFileExist, {
		variables: {
			owner: url.user,
			name: url.repository,
			file: `${url.branch}:${url.filePath}`,
		},
	});

	return Boolean(repository.file);
}
