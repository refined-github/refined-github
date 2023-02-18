import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import GitHubURL from '../github-helpers/github-url';
import doesFileExist from '../github-helpers/does-file-exist';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepo, getForkedRepo} from '../github-helpers';

const isFilePath = (): boolean =>
	pageDetect.isSingleFile()
	|| pageDetect.isRepoTree()
	|| pageDetect.hasFileEditor();

// Only enable the feature on known-shared pages

const isLikelyToBeOnBothRepos = (): boolean =>
	isFilePath()
	|| pageDetect.isIssueOrPRList()
	|| pageDetect.isTags();

async function getEquivalentURL(): Promise<string> {
	const forkedRepository = getRepo(getForkedRepo())!;
	const defaultUrl = '/' + forkedRepository.nameWithOwner;

	if (!isLikelyToBeOnBothRepos()) {
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
	const equivalentUrl = await getEquivalentURL()
	const forkLink = await elementReady(`a[data-hovercard-url="/${getForkedRepo()!}/hovercard"]`);
	forkLink!.href = equivalentUrl;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isForkedRepo,
	],
	// We can't use `exclude` because the header is outside the ajaxed area so it must be manually reset even when the feature doesn't apply there
	awaitDomReady: false,
	init,
});

/*

Test URLs

- Folder: https://github.com/fregante/refined-github/tree/main/.github
- PR list: https://github.com/fregante/refined-github/pulls
- Tags list: https://github.com/fregante/refined-github/tags

*/
