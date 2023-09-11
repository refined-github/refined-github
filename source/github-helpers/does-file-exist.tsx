import api from './api.js';
import GitHubFileURL from './github-file-url.js';
import DoesFileExist from './does-file-exist.gql';

export default async function doesFileExist(url: GitHubFileURL): Promise<boolean> {
	const {repository} = await api.v4(DoesFileExist, {
		variables: {
			owner: url.user,
			name: url.repository,
			file: `${url.branch}:${url.filePath}`,
		},
	});

	return Boolean(repository.file);
}
