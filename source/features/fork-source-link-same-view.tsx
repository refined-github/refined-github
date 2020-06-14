import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';

const checkIfFileExists = async (url: GitHubURL): Promise<boolean> => {
	const {repository} = await api.v4(`
		repository(owner: "${url.user}", name: "${url.repository}") {
			file: object(expression: "${url.branch}:${url.filePath}") {
				... on Blob {
					id
				}
			}
		}
	`);

	return Boolean(repository.file);
};

// eslint-disable-next-line import/prefer-default-export
export function createHEADLink(baseRepo: string): string {
	if (pageDetect.isRepoRoot() || !(pageDetect.isSingleFile() || pageDetect.isRepoTree())) {
		return '/' + baseRepo;
	}

	const [user, repository] = baseRepo.split('/');
	const url = new GitHubURL(location.href).assign({
		user,
		repository,
		branch: 'HEAD'
	});

	return url.pathname;
}

async function init(): Promise<void | false> {
	const forkSource = select<HTMLAnchorElement>('.fork-flag .text a')!;
	const sameViewUrl = createHEADLink(forkSource.textContent!);
	if (sameViewUrl === forkSource.pathname) {
		return false;
	}

	const url = new URL(sameViewUrl, location.origin);
	if (await checkIfFileExists(new GitHubURL(url.href))) {
		forkSource.pathname = sameViewUrl;
	}
}

void features.add({
	id: __filebasename,
	description: 'Redirects the source repository link of a fork to the same view in the source.',
	screenshot: false
}, {
	include: [
		pageDetect.isRepo
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	init
});
