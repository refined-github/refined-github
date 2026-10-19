import type {DelegateEvent} from 'delegate-it';
import memoize from 'memoize';
import {$$} from 'select-dom';

import preserveScroll from './preserve-scroll.js';

type EventHandler = (event: DelegateEvent<MouseEvent, HTMLElement>) => void;

function clickAllExcept(elementsToClick: string, except: HTMLElement): void {
	for (const item of $$(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}
}

// eslint-disable-next-line unicorn/no-top-level-side-effects -- TODO: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3895
export default memoize((selector: string | ((clickedItem: HTMLElement) => string)): EventHandler => event => {
	if (!(event.altKey && event.isTrusted)) {
		return;
	}

	const clickedItem = event.delegateTarget;

	// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
	const resetScroll = preserveScroll(clickedItem.parentElement!);
	clickAllExcept(typeof selector === 'string' ? selector : selector(clickedItem), clickedItem);
	resetScroll();
});
