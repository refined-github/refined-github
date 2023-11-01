import mem from 'mem';
import {$$} from 'select-dom';
import {DelegateEvent} from 'delegate-it';

import preserveScroll from './preserve-scroll.js';

type EventHandler = (event: DelegateEvent<MouseEvent, HTMLElement>) => void;
export default mem((selector: string | ((clickedItem: HTMLElement) => string)): EventHandler => event => {
	if (event.altKey && event.isTrusted) {
		const clickedItem = event.delegateTarget;

		// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
		const resetScroll = preserveScroll(clickedItem.parentElement!);
		clickAllExcept(typeof selector === 'string' ? selector : selector(clickedItem), clickedItem);
		resetScroll();
	}
});

function clickAllExcept(elementsToClick: string, except: HTMLElement): void {
	for (const item of $$(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}
}
