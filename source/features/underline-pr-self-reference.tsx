import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getConversationNumber} from '../github-helpers/index.js';

function underlinePrSelfReference(prConversation: HTMLElement): void {
	const prNumber = getConversationNumber();

	const prLink = prConversation.textContent;
	const prSelfReference = '#' + prNumber!.toString();

	if (prLink.includes(prSelfReference)) {
		prConversation.style.textDecoration = 'underline wavy red';
	}
}

function init(signal: AbortSignal): void {
	observe('.issue-link', underlinePrSelfReference, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

## Test URLs

https://github.com/prettier/prettier/pull/9275

*/
