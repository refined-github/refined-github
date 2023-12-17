import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function onButtonClick({delegateTarget: delegate, target}: DelegateEvent): void {
	// Only close if clicking outside of modal
	if (delegate === target) {
		delegate.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'Escape', code: 'Escape'}));
	}
}

function init(signal: AbortSignal): void {
	delegate('[class*="Dialog__Backdrop-"]', 'click', onButtonClick, {signal});
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
