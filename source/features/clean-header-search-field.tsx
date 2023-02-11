import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import select from 'select-dom';

import features from '../feature-manager';

async function init(): Promise<void> {
	const headerSearchButton = await elementReady('button.header-search-button, input.header-search-input');
	if (headerSearchButton instanceof HTMLInputElement) {
		// Previous version #6310
		// TODO: Remove in mid 2023
		headerSearchButton.value = '';
		return;
	}

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
