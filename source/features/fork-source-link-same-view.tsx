import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepo, getForkedRepo} from '../github-helpers';

const isFilePath = (): boolean => pageDetect.isSingleFile()
	|| pageDetect.isRepoTree()
	|| pageDetect.hasFileEditor();

async function getEquivalentURL(): Promise<string> {
	const forkedRepository = getRepo(getForkedRepo())!;
	const defaultUrl = '/' + forkedRepository.nameWithOwner;

	// Do not use `isConversation` https://github.com/refined-github/refined-github/pull/5494#discussion_r829019629
	if (pageDetect.isIssue() || pageDetect.isPR() || pageDetect.isRepoRoot()) {
		// We must reset the link because the header is outside the ajaxed area
		return defaultUrl;
	}

	const sameViewUrl = new GitHubURL(location.href).assign({
		user: forkedRepository.owner,
		repository: forkedRepository.name,
	});

	if (isFilePath()) {
		sameViewUrl.branch = await getDefaultBranch(forkedRepository);
		if (!await doesFileExist(sameViewUrl)) {
			return defaultUrl;
		}
	}

	return sameViewUrl.href;
}

async function init(): Promise<void> {
	// The link must always be updated/reset. This pattern ensures that the link is always updated and never fails through some conditions.
	select(`a[data-hovercard-url="/${getForkedRepo()!}/hovercard"]`)!.href = await getEquivalentURL();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isForkedRepo,
	],
	// We can't use `exclude` because the header is outside the ajaxed area so it must be manually reset even when the feature doesn't apply there
	deduplicate: false,
	init,
});
