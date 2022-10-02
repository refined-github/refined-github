import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

async function init(): Promise<void> {
	(await elementReady('input.header-search-input'))!.value = '';
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
		pageDetect.isGlobalIssueOrPRList,
		pageDetect.isGlobalSearchResults,
		pageDetect.isRepoSearch,
	],
	awaitDomReady: false,
	init,
});
