import './show-all-pr-checks.css'
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function init(signal: AbortSignal): void {
	delegate(
		'button[aria-label="Expand checks"]',
		'click',
		({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>) => {
			delegateTarget.closest('section[aria-label="Checks"]')!.classList.add('rgh-show-all-pr-checks');
		},
		{signal, capture: true},
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
