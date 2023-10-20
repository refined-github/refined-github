import {$} from 'select-dom';
import oneEvent from 'one-event';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';

const paginationButtonSelector = '.ajax-pagination-form button[type="submit"]';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function expandHidden(paginationButton: HTMLButtonElement | undefined) {
	let wrapper: Element = paginationButton!.form!.parentElement!;
	const isExpandingMainThread = wrapper.id === 'js-progressive-timeline-item-container';

	while (paginationButton) {
		// eslint-disable-next-line no-await-in-loop
		await oneEvent(paginationButton.form!, 'page:loaded');
		if (isExpandingMainThread) {
			// Pagination forms in the main thread load their content in a nested wrapper
			wrapper = wrapper.lastElementChild!;
		}

		paginationButton = $(`:scope > ${paginationButtonSelector}`, wrapper);
		paginationButton?.click();
	}
}

async function handleAltClick({altKey, delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	if (!altKey) {
		return;
	}

	await showToast(expandHidden(delegateTarget), {message: 'Expanding…', doneMessage: 'Expanded'});
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
