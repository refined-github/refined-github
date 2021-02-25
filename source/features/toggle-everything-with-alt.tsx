import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {CheckIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import preserveScroll from '../helpers/preserve-scroll';
import progressNotification from '../github-helpers/progress-notification';

type EventHandler = (event: delegate.Event<MouseEvent, HTMLElement>) => void;
// eslint-disable-next-line import/prefer-default-export
export const clickAll = mem((selectorGetter: ((clickedItem: HTMLElement) => string), displayProgress?: boolean): EventHandler => {
	return event => {
		if (event.altKey && event.isTrusted) {
			const clickedItem = event.delegateTarget;

			// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
			const resetScroll = preserveScroll(clickedItem.parentElement!);
			clickAllExcept(selectorGetter(clickedItem), clickedItem, displayProgress);
			resetScroll();
		}
	};
});

function clickAllExcept(elementsToClick: string, except: HTMLElement, displayProgress = false): void {
	let notification: Element;
	if (displayProgress) {
		const spinner = (
			<span className="Toast-icon">
				<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
					<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/>
					<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"/>
				</svg>
			</span>
		);
		notification = progressNotification('Toast--loading', spinner, 'Bulk actions currently being processed.');
		document.body.append(notification);
	}

	for (const item of select.all(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}

	if (displayProgress) {
		notification.replaceWith(progressNotification('Toast--success', <CheckIcon/>, 'Bulk action processing complete.'));
		setTimeout(() => {
			select('.Toast--success')!.remove();
		}, 3000);
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

function init(): void {
	// Collapsed comments in PR conversations and files
	delegate(document, '.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector));

	// "Load diff" buttons in PR files
	delegate(document, '.js-file .js-diff-load', 'click', clickAll(allDiffsSelector));

	// Review comments in PR
	delegate(document, '.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector));
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	init
});
