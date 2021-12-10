import mem from 'mem';
import select from 'select-dom';
import delegate from 'delegate-it';

import preserveScroll from './preserve-scroll.js';

type EventHandler = (event: delegate.Event<MouseEvent, HTMLElement>) => void;
export default mem((selectorGetter: ((clickedItem: HTMLElement) => string)): EventHandler => event => {
	if (event.altKey && event.isTrusted) {
		const clickedItem = event.delegateTarget;

		// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
		const resetScroll = preserveScroll(clickedItem.parentElement!);
		clickAllExcept(selectorGetter(clickedItem), clickedItem);
		resetScroll();
	}
});

function clickAllExcept(elementsToClick: string, except: HTMLElement): void {
	for (const item of select.all(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}
}
