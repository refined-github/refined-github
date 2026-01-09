import {$optional} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function init(signal: AbortSignal): void {
	// When the "Show all checks" button is clicked, remove the height restriction from the checks list
	delegate(
		'details:has(.merge-status-list) > summary',
		'click',
		({delegateTarget}: DelegateEvent<MouseEvent, HTMLElement>) => {
			const details = delegateTarget.closest('details')!;
			// Only apply when expanding (details will be opened after the click)
			if (!details.open) {
				const checksList = $optional('.merge-status-list.js-updatable-content-preserve-scroll-position', details);
				if (checksList) {
					checksList.style.maxHeight = 'none';
				}
			}
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
