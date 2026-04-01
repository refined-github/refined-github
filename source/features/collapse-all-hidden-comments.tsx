import oneEvent from 'one-event';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';
import {paginationButtonSelector} from '../github-helpers/selectors.js';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function collapseOneBatch(paginationButton: HTMLButtonElement | undefined) {
	if (!paginationButton) {
		return;
	}

	await oneEvent(paginationButton.form!, 'page:loaded');
	paginationButton.click();
}

async function handleAltClick({altKey, delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	if (!altKey) {
		return;
	}

	await showToast(collapseOneBatch(delegateTarget), {
		message: 'Collapsing…',
		doneMessage: 'Collapsed a little',
	});
}

function init(signal: AbortSignal): void {
	delegate(paginationButtonSelector, 'click', handleAltClick, {signal});
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
