import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

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

// eslint-disable-next-line import/prefer-default-export
export function createHEADLink(baseRepo: string): URL | GitHubURL {
	const url = new GitHubURL(location.href);
	if (!url.filePath) {
		return new URL(baseRepo, location.origin);
	}

	const [user, repository] = baseRepo.split('/');
	url.assign({
		user,
		repository,
		branch: 'HEAD'
	});

	return url;
}

async function init(): Promise<void | false> {
	const forkSource = select<HTMLAnchorElement>('.fork-flag .text a')!;
	const sameViewUrl = createHEADLink(forkSource.textContent!);
	if (sameViewUrl.pathname === forkSource.pathname) {
		return false;
	}

	if (await checkIfFileExists(sameViewUrl as GitHubURL)) {
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
