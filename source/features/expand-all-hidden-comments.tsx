/**
@description On long conversations where GitHub hides comments under a "N hidden items. Load more...", alt-clicking it will load up to 200 comments at once instead of 60.
@screenshot https://github-production-user-asset-6210df.s3.amazonaws.com/83146190/261160123-9c4f894b-38c0-446f-af50-9beca7ff1f74.png
*/

import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import oneEvent from 'one-event';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';
import {paginationButtonSelector} from '../github-helpers/selectors.js';
import showToast from '../github-helpers/toast.js';

async function expandHidden(paginationButton: HTMLButtonElement | undefined): Promise<void> {
	let wrapper: Element = paginationButton!.form!.parentElement!;
	const isExpandingMainThread = wrapper.id === 'js-progressive-timeline-item-container';

	while (paginationButton) {
		// eslint-disable-next-line no-await-in-loop
		await oneEvent(paginationButton.form!, 'page:loaded');
		if (isExpandingMainThread) {
			// Pagination forms in the main thread load their content in a nested wrapper
			wrapper = wrapper.lastElementChild!;
		}

		paginationButton = $optional(`:scope > ${paginationButtonSelector}`, wrapper);

		// Missing if we reached the end
		paginationButton?.click();
	}
}

async function handleAltClick({altKey, delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	if (!altKey) {
		return;
	}

	await showToast(expandHidden(delegateTarget), {
		message: 'Expanding…',
		doneMessage: 'Expanded',
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
