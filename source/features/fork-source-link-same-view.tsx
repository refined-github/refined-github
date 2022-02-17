import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepo, getForkedRepo} from '../github-helpers';

const isFilePath = (): boolean => pageDetect.isSingleFile()
	|| (pageDetect.isRepoTree() && !pageDetect.isRepoRoot())
	|| pageDetect.hasFileEditor();

async function init(): Promise<void> {
	const forkedRepository = getRepo(getForkedRepo())!;
	const sameViewUrl = new GitHubURL(location.href).assign({
		user: forkedRepository.owner,
		repository: forkedRepository.name,
	});

	if (isFilePath()) {
		sameViewUrl.branch = await getDefaultBranch(forkedRepository);
	} else if (pageDetect.isIssue() || pageDetect.isPR()) {
		sameViewUrl.assign({
			route: '',
			branch: '',
			filePath: '',
		});
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
	deduplicate: false,
	init,
});
