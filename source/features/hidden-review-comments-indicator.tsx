import './hidden-review-comments-indicator.css';
import mem from 'mem';
import React from 'dom-chef';
import {$$} from 'select-dom';
import {CommentIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import preserveScroll from '../helpers/preserve-scroll.js';
import onAbort from '../helpers/abort-controller.js';
import observe from '../helpers/selector-observer.js';

// When an indicator is clicked, this will show comments on the current file
function handleIndicatorClick({delegateTarget}: DelegateEvent): void {
	const commentedLine = delegateTarget.closest('tr')!.previousElementSibling!;
	const resetScroll = preserveScroll(commentedLine);
	delegateTarget
		.closest('.file.js-file')!
		.querySelector('input.js-toggle-file-notes')!
		.click();

	resetScroll();
}

// `mem` avoids adding the indicator twice to the same thread
const addIndicator = mem((commentThread: HTMLElement): void => {
	const commentCount = commentThread.querySelectorAll('.review-comment.js-comment').length;
	commentThread.before(
		<tr>
			<td className="rgh-comments-indicator blob-num" colSpan={2}>
				<button type="button" className="btn-link">
					<CommentIcon/>
					<span>{commentCount}</span>
				</button>
			</td>
		</tr>,
	);
});

// Add indicator when the `show-inline-notes` class is removed (i.e. the comments are hidden)
const indicatorToggleObserver = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		const file = mutation.target as HTMLElement;
		const wasVisible = mutation.oldValue!.includes('show-inline-notes');
		const isHidden = !file.classList.contains('show-inline-notes');
		if (wasVisible && isHidden) {
			for (const thread of $$('tr.inline-comments', file)) {
				addIndicator(thread);
			}
		}
	}
});

function init(signal: AbortSignal): void {
	observe('.file.js-file', element => {
		// #observe won't observe the same element twice
		// TODO: toggle visibility via :has selector instead
		indicatorToggleObserver.observe(element, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class'],
		});
	});

	delegate('.rgh-comments-indicator', 'click', handleIndicatorClick, {signal});

	onAbort(signal, indicatorToggleObserver);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	init,
});

/*
Test URLs:

https://github.com/refined-github/sandbox/pull/18/files

*/
