import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo, getForkedRepo} from '../github-helpers';

async function init(): Promise<void> {
	const forkedRepository = getRepositoryInfo(getForkedRepo());
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: forkedRepository.owner,
		repository: forkedRepository.name,
		branch: await getDefaultBranch(forkedRepository)
	});

	if (await doesFileExist(sameViewUrl)) {
		select<HTMLAnchorElement>(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`)!.pathname = sameViewUrl.pathname;
	}
}

void features.add({
	id: __filebasename,
	description: 'Points the “Forked from user/repository” link to current folder or file in the upstream repository.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/84795784-3722d000-aff8-11ea-9b34-97c01acf4fd4.png',
	testOn: ''
}, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
		pageDetect.isEditingFile
	],
	exclude: [
		() => !pageDetect.isForkedRepo(),
		pageDetect.isRepoRoot
	],
	init
});
