import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo} from '../github-helpers';

const checkIfFileExists = async (url: GitHubURL): Promise<boolean> => {
	const {repository} = await api.v4(`
		repository(owner: "${url.user}", name: "${url.repository}") {
			file: object(expression: "${url.branch}:${url.filePath}") {
				id
			}
		}
	`);

	return Boolean(repository.file);
};

async function init(): Promise<void> {
	const currentRepository = getRepositoryInfo();
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: currentRepository.owner,
		repository: currentRepository.name,
		branch: 'HEAD'
	});

	const forkSource = select<HTMLAnchorElement>('.fork-flag .text a')!;
	if (sameViewUrl.pathname === forkSource.pathname) {
		return false;
	}
	if (await checkIfFileExists(sameViewUrl)) {
		forkSource.pathname = sameViewUrl.pathname;
	}
}

void features.add({
	id: __filebasename,
	description: 'Points the “Forked from user/repository” link to current folder or file in the upstream repository.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/84795784-3722d000-aff8-11ea-9b34-97c01acf4fd4.png'
}, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree
	],
	exclude: [
		() => !pageDetect.isForkedRepo(),
		() => !pageDetect.isRepoRoot()
	],
	init
});
