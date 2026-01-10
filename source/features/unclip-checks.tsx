import './unclip-checks.css';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function init(signal: AbortSignal): void {
	delegate(
		'button[aria-label="Expand checks"]',
		'click',
		({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>) => {
			delegateTarget.closest('section[aria-label="Checks"]')!.classList.add('rgh-unclip-checks');
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

https://togithub.com/facebook/react/pull/34051

*/
