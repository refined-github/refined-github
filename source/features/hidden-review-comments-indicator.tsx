import './hidden-review-comments-indicator.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import CommentIcon from 'octicon/comment.svg';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import anchorScroll from '../libs/anchor-scroll';
import onPrFileLoad from '../libs/on-pr-file-load';

// When an indicator is clicked, this will show comments on the current file
const handleIndicatorClick = ({delegateTarget}: delegate.Event): void => {
	const commentedLine = delegateTarget.closest('tr')!.previousElementSibling!;
	const resetScroll = anchorScroll(commentedLine);
	delegateTarget
		.closest('.file.js-file')!
		.querySelector<HTMLInputElement>('.js-toggle-file-notes')!
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
		</tr>
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
			attributeFilter: ['class']
		});
	}
}

function init(): void {
	observeFiles();
	onPrFileLoad(observeFiles);
	delegate(document, '.rgh-comments-indicator', 'click', handleIndicatorClick);
}

features.add({
	id: __filebasename,
	description: 'Adds comment indicators when comments are hidden in PR review.',
	screenshot:
		'https://user-images.githubusercontent.com/1402241/63112671-011d5580-bfbb-11e9-9e19-53e11641990e.gif'
}, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	init
});
