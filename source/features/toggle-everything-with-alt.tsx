import mem from 'mem';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import anchorScroll from '../libs/anchor-scroll';

type EventHandler = (event: delegate.Event<MouseEvent, HTMLElement>) => void;

function init(): void {
	// Collapsed comments in PR conversations and files
	delegate(document, '.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector));

	// "Load diff" buttons in PR files
	delegate(document, '.js-file .js-diff-load', 'click', clickAll(allDiffsSelector));

	// Review comments in PR
	delegate(document, '.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector));
}

const clickAll = mem((selectorGetter: ((clickedItem: HTMLElement) => string)): EventHandler => {
	return event => {
		if (event.altKey && event.isTrusted) {
			const clickedItem = event.delegateTarget;

			// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
			const resetScroll = anchorScroll(clickedItem.parentElement!);
			clickAllExcept(selectorGetter(clickedItem), clickedItem);
			resetScroll();
		}
	};
});

function clickAllExcept(elementsToClick: string, except: HTMLElement): void {
	for (const item of select.all(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}
}

function allDiffsSelector(): string {
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

features.add({
	id: __filebasename,
	description: 'Adds a shortcut to toggle all similar items (minimized comments, deferred diffs, etc) at once: `alt` `click` on each button or checkbox.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/62208543-dcb75b80-b3b4-11e9-984f-ddb479ea149d.gif'
}, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	init
});
