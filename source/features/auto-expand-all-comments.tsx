import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import expandHidden from '../github-helpers/expand-hidden-comments.js';
import {paginationButtonSelector} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';

function autoExpand(paginationButton: HTMLButtonElement): void {
	paginationButton.click();
	void expandHidden(paginationButton);
}

function init(signal: AbortSignal): void {
	observe(paginationButtonSelector, autoExpand, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*
Test URLs
https://github.com/rust-lang/rfcs/pull/2544
*/
