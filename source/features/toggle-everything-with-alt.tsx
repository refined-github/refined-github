import mem from 'mem';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import preserveScroll from '../helpers/preserve-scroll';

type EventHandler = (event: delegate.Event<MouseEvent, HTMLElement>) => void;
// eslint-disable-next-line import/prefer-default-export
export const clickAll = mem((selectorGetter: ((clickedItem: HTMLElement) => string)): EventHandler => event => {
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

function diffsSelector(): string {
	return '.js-file .js-diff-load';
}

function minimizedCommentsSelector(clickedItem: HTMLElement): string {
	if ((clickedItem.parentElement as HTMLDetailsElement).open) {
		return '.minimized-comment > details[open] > summary';
	}

	return '.minimized-comment > details:not([open]) > summary';
}

function resolvedCommentsSelector(clickedItem: HTMLElement): string {
	return `.js-resolvable-thread-toggler[aria-expanded="${clickedItem.getAttribute('aria-expanded')!}"]:not(.d-none)`;
}

function expandSelector(): string {
	return '.js-file .js-expand-full';
}

function collapseSelector(): string {
	return '.js-file .js-collapse-diff';
}

function init(): void {
	// Collapsed comments in PR conversations and files
	delegate(document, '.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector));

	// "Load diff" buttons in PR files
	delegate(document, '.js-file .js-diff-load', 'click', clickAll(diffsSelector));

	// Review comments in PR
	delegate(document, '.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector));

	// "Expand all" and "Collapse expanded lines" buttons in commit files
	delegate(document, '.js-file .js-expand-full', 'click', clickAll(expandSelector));
	delegate(document, '.js-file .js-collapse-diff', 'click', clickAll(collapseSelector));
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation,
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
