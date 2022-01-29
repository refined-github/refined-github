import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepo, getForkedRepo} from '../github-helpers';

const isFilePath = (): boolean => pageDetect.isSingleFile()
	|| (pageDetect.isRepoTree() && !pageDetect.isRepoRoot())
	|| pageDetect.isEditingFile();

async function init(): Promise<void> {
	const forkedRepository = getRepo(getForkedRepo())!;
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: forkedRepository.owner,
		repository: forkedRepository.name,
	});

	if (isFilePath()) {
		sameViewUrl.branch = await getDefaultBranch(forkedRepository);
	}

	if (!isFilePath() || await doesFileExist(sameViewUrl)) {
		select<HTMLAnchorElement>(`[data-hovercard-url="/${getForkedRepo()!}/hovercard"]`)!
			.pathname = sameViewUrl.pathname;
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	exclude: [
		pageDetect.isConversation,
	],
	deduplicate: false,
	init,
});
