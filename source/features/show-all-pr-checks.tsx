import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function init(signal: AbortSignal): void {
	delegate(
		'button[aria-label="Expand checks"]',
		'click',
		({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>) => {
			// Find the expandable wrapper - it's a sibling of the button's container
			const container = delegateTarget.closest('[class*="MergeBoxExpandable"]')!;
			const expandableWrapper = $('[class*="expandableWrapper"]', container);
			expandableWrapper.style.maxHeight = 'none';
		},
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/7166

*/
