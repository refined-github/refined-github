import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function onButtonClick({delegateTarget: delegate, target}: DelegateEvent): void {
	// Only close if clicking outside of modal
	if (delegate === target) {
		$('[class^="Dialog__DialogCloseButton-"], [class*=" Dialog__DialogCloseButton-"]', delegate)?.click();
	}
}

function init(signal: AbortSignal): void {
	delegate('#__primerPortalRoot__ :is([class^="Dialog__Backdrop-"], [class*=" Dialog__Backdrop-"])', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isBranches,
		pageDetect.isRepoCommitList,
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	init,
});

/*

## Test URLs

- https://github.com/refined-github/refined-github
- https://github.com/refined-github/refined-github/branches
- https://github.com/refined-github/refined-github/commits/main/
- https://github.com/refined-github/refined-github/blob/main/package.json

*/
