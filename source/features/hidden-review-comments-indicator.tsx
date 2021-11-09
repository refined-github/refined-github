import './hidden-review-comments-indicator.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {CommentIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import preserveScroll from '../helpers/preserve-scroll';
import onDiffFileLoad from '../github-events/on-diff-file-load';

// When an indicator is clicked, this will show comments on the current file
const handleIndicatorClick = ({delegateTarget}: delegate.Event): void => {
	const commentedLine = delegateTarget.closest('tr')!.previousElementSibling!;
	const resetScroll = preserveScroll(commentedLine);
	delegateTarget
		.closest('.file.js-file')!
		.querySelector('input.js-toggle-file-notes')!
		.click();

	resetScroll();
};

// `mem` avoids adding the indicator twice to the same thread
const addIndicator = mem((commentThread: HTMLElement): void => {
	const commentCount = commentThread.querySelectorAll('.review-comment .js-comment').length;

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
const observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		const file = mutation.target as HTMLElement;
		const wasVisible = mutation.oldValue!.includes('show-inline-notes');
		const isHidden = !file.classList.contains('show-inline-notes');
		if (wasVisible && isHidden) {
			for (const thread of select.all('tr.inline-comments', file)) {
				addIndicator(thread);
			}
		}
	}
});

function observeFiles(): void {
	for (const element of select.all('.file.js-file')) {
		// #observe won't observe the same element twice
		observer.observe(element, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class'],
		});
	}
}

function init(): void {
	observeFiles();
	onDiffFileLoad(observeFiles);
	delegate(document, '.rgh-comments-indicator', 'click', handleIndicatorClick);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
