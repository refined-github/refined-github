import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepositoryInfo, getForkedRepo} from '../github-helpers';

async function init(): Promise<void> {
	const forkedRepository = getRepositoryInfo(getForkedRepo())!;
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: forkedRepository.owner,
		repository: forkedRepository.name,
		branch: await getDefaultBranch(forkedRepository)
	});

	if (await doesFileExist(sameViewUrl)) {
		select<HTMLAnchorElement>(`[data-hovercard-type="repository"][href="/${getForkedRepo()!}"]`)!.pathname = sameViewUrl.pathname;
	}
}

void features.add(__filebasename, {
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
