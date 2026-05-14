import oneEvent from 'one-event';
import {$optional} from 'select-dom';

import {paginationButtonSelector} from './selectors.js';

// Expects `paginationButton` to have already been clicked by the caller. Awaits its
// `page:loaded` event, then clicks subsequent pagination buttons in the same wrapper
// until the thread is fully expanded.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function expandHidden(paginationButton: HTMLButtonElement | undefined) {
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
