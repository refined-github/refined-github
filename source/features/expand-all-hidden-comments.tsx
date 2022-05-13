import select from 'select-dom';
import oneEvent from 'one-event';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const paginationButtonSelector = '.ajax-pagination-form button[type="submit"]';

async function handleAltClick({altKey, delegateTarget}: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	if (!altKey) {
		return;
	}

	let paginationButton: HTMLButtonElement | undefined = delegateTarget;
	let wrapper: Element = paginationButton.form!.parentElement!;
	const isExpandingMainThread = wrapper.id === 'js-progressive-timeline-item-container';

	while (paginationButton) {
		// eslint-disable-next-line no-await-in-loop
		await oneEvent(paginationButton.form!, 'page:loaded');
		if (isExpandingMainThread) {
			// Pagination forms in the main thread load their content in a nested wrapper
			wrapper = wrapper.lastElementChild!;
		}

		paginationButton = select(`:scope > ${paginationButtonSelector}`, wrapper);
		paginationButton?.click();
	}
}

function init(): Deinit {
	return delegate(document, paginationButtonSelector, 'click', handleAltClick);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
