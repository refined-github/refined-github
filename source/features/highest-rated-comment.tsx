import './highest-rated-comment.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';
import ArrowDownIcon from 'octicons-plain-react/ArrowDown';
import CheckCircleFillIcon from 'octicons-plain-react/CheckCircleFill';
import {$, $$, $$optional, $closest, $optional} from 'select-dom';

import features from '../feature-manager.js';
import isLowQualityComment from '../helpers/is-low-quality-comment.js';
import looseParseInt from '../helpers/loose-parse-int.js';
import {singleParagraphCommentSelector} from './hide-low-quality-comments.js';

// `.js-timeline-item` gets the nearest comment excluding the very first comment (OP post)
const commentSelector = '.js-timeline-item, .react-issue-comment';
const commentBodySelector = '.comment-body, [data-testid="markdown-body"]';
const commentHeaderSelector = '.unminimized-comment .timeline-comment-header > h3, [data-testid="comment-header"] [data-testid="avatar-link"]';
const commentLinkSelector = 'a.js-timestamp, [data-testid="comment-header"] a[href*="#issuecomment-"]';
const commentAvatarSelector = 'img.avatar, img[data-testid="github-avatar"]';

const positiveReactionsSelector = `
	${commentSelector} [aria-label="react with thumbs up"],
	${commentSelector} [aria-label="react with hooray"],
	${commentSelector} [aria-label="react with heart"],
	${commentSelector} [aria-label^="👍 "],
	${commentSelector} [aria-label^="🎉 "],
	${commentSelector} [aria-label^="❤️ "]
`;

const negativeReactionsSelector = `
	${commentSelector} [aria-label="react with thumbs down"],
	${commentSelector} [aria-label^="👎 "]
`;

function selectSum(selector: string, container: HTMLElement): number {
	return $$(selector, container).reduce((sum, element) => sum + looseParseInt(element), 0);
}

const getPositiveReactions = mem((comment: HTMLElement): number | void => {
	const count = selectSum(positiveReactionsSelector, comment);
	if (
		// It needs to be upvoted enough times
		count >= 10
		// It can't be a controversial comment
		&& selectSum(negativeReactionsSelector, comment) < count / 2
	) {
		return count;
	}
});

function getBestComment(): HTMLElement | undefined {
	let highest: {comment: HTMLElement; count: number} | undefined;
	// $$optional because there might not be any positive reactions at all
	for (const reaction of $$optional(positiveReactionsSelector)) {
		const comment = $closest(commentSelector, reaction);
		const positiveReactions = getPositiveReactions(comment);
		if (positiveReactions && (!highest || positiveReactions > highest.count)) {
			highest = {comment, count: positiveReactions};
		}
	}

	return highest === undefined ? undefined : highest.comment;
}

function highlightBestComment(bestComment: Element): void {
	const oldComment = $optional('.unminimized-comment', bestComment);
	if (oldComment) {
		oldComment.classList.add('rgh-highest-rated-comment');
	}

	bestComment.classList.toggle('rgh-highest-rated-comment', bestComment.matches('.react-issue-comment'));
	$(commentHeaderSelector, bestComment).before(
		<span
			className="color-fg-success tooltipped tooltipped-s"
			aria-label="This comment has the most positive reactions on this issue."
		>
			<CheckCircleFillIcon />
		</span>,
	);
}

function linkBestComment(bestComment: HTMLElement): void {
	// Find position of comment in thread
	const position = $$(commentSelector).indexOf(bestComment);

	// Only link to it if it doesn't already appear at the top of the conversation
	if (position < 3) {
		return;
	}

	const text = $(commentBodySelector, bestComment).textContent.slice(0, 100);
	const {hash} = $(commentLinkSelector, bestComment);
	const avatar = $(commentAvatarSelector, bestComment).cloneNode();
	const anchor = (
		<a
			href={hash}
			className="no-underline rounded-1 rgh-highest-rated-comment timeline-comment color-bg-subtle px-2 d-flex flex-items-center"
		>
			{avatar}

			<h3 className="timeline-comment-header-text f5 color-fg-muted text-normal text-italic css-truncate css-truncate-overflow mr-2">
				<span className="Label mr-2">Highest-rated</span>
				{text}
			</h3>

			<div className="color-fg-muted f6 no-wrap">
				<ArrowDownIcon className="mr-1" />Jump to comment
			</div>
		</a>
	);

	if (bestComment.matches('.react-issue-comment')) {
		$('[data-testid="issue-body"]').after(anchor);
	} else {
		bestComment.parentElement!.firstElementChild!.after(anchor);
	}
}

function init(): false | void {
	const bestComment = getBestComment();
	if (!bestComment) {
		return false;
	}

	const firstParagraph = $optional(`${singleParagraphCommentSelector}, [data-testid="markdown-body"] > p:only-child`, bestComment);
	const commentText = firstParagraph === undefined ? undefined : firstParagraph.textContent;
	if (commentText && isLowQualityComment(commentText)) { // #5567
		return false;
	}

	linkBestComment(bestComment);
	highlightBestComment(bestComment);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // Must wait for all to pick the best one
	init,
});

/*
Test URLs:

- 8th comment, has link: https://github.com/refined-github/refined-github/issues/4166
- 2nd comment, no link: https://github.com/refined-github/refined-github/issues/825
*/
