import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo} from '../github-helpers';

async function init(): Promise<void> {
	const currentRepository = getRepositoryInfo();
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: currentRepository.owner,
		repository: currentRepository.name,
		branch: await getDefaultBranch(currentRepository)
	});

	if (await doesFileExist(sameViewUrl)) {
		select<HTMLAnchorElement>('.fork-flag .text a')!.pathname = sameViewUrl.pathname;
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
		() => pageDetect.isRepoRoot()
	],
	init
});
