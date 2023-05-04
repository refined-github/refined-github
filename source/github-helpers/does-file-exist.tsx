import * as api from './api.js';
import GitHubURL from './github-url.js';

export default async function doesFileExist(url: GitHubURL): Promise<boolean> {
	const {repository} = await api.v4(`
		repository(owner: "${url.user}", name: "${url.repository}") {
			file: object(expression: "${url.branch}:${url.filePath}") {
				id
			}
		}
	`);

	return Boolean(repository.file);
}
