import './unclip-checks.css';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {closestElement} from 'select-dom';

import features from '../feature-manager.js';

function unclipChecks({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	closestElement('section[aria-label="Checks"]', delegateTarget).classList.add('rgh-unclip-checks');
}

function init(signal: AbortSignal): void {
	delegate(
		'button[aria-label="Expand checks"]',
		'click',
		unclipChecks,
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
