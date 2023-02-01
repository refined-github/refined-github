import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import select from 'select-dom';

import features from '../feature-manager';

async function init(): Promise<void> {
	const headerSearchButton = await elementReady('button.header-search-button');
	headerSearchButton!.classList.add('placeholder');
	select('[data-target="search-input.inputButtonText"]', headerSearchButton)!.textContent = headerSearchButton!.getAttribute('placeholder');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
		pageDetect.isGlobalIssueOrPRList,
		pageDetect.isRepoSearch,
	],
	awaitDomReady: false,
	init,
});
