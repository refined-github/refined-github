import './highest-rated-comment.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {ArrowDownIcon, CheckCircleFillIcon} from '@primer/octicons-react';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

// `.js-timeline-item` gets the nearest comment excluding the very first comment (OP post)
const commentSelector = '.js-timeline-item';

const positiveReactionsSelector = `
	${commentSelector} [aria-label*="reacted with thumbs up"],
	${commentSelector} [aria-label*="reacted with hooray"],
	${commentSelector} [aria-label*="reacted with heart"]
`;

const negativeReactionsSelector = `
	${commentSelector} [aria-label*="reacted with thumbs down"]
`;

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
	let highest;
	for (const reaction of select.all(positiveReactionsSelector)) {
		const comment = reaction.closest(commentSelector)!;
		const positiveReactions = getPositiveReactions(comment);
		if (positiveReactions && (!highest || positiveReactions > highest.count)) {
			highest = {comment, count: positiveReactions};
		}
	}

	return highest?.comment;
}

function highlightBestComment(bestComment: Element): void {
	select('.unminimized-comment', bestComment)!.classList.add('rgh-highest-rated-comment');
	select('.unminimized-comment .timeline-comment-header-text', bestComment)!.before(
		<span
			className="color-text-success color-fg-success tooltipped tooltipped-s"
			aria-label="This comment has the most positive reactions on this issue."
		>
			<CheckCircleFillIcon/>
		</span>,
	);
}

function linkBestComment(bestComment: HTMLElement): void {
	// Find position of comment in thread
	const position = select.all(commentSelector).indexOf(bestComment);
	// Only link to it if it doesn't already appear at the top of the conversation
	if (position < 3) {
		return;
	}

	const text = select('.comment-body', bestComment)!.textContent!.slice(0, 100);
	const {hash} = select<HTMLAnchorElement>('a.js-timestamp', bestComment)!; // TODO: Drop generic once TypeScript sorts it out, it shouldn't be needed
	const avatar = select('img.avatar', bestComment)!.cloneNode();

	bestComment.parentElement!.firstElementChild!.after(
		<a href={hash} className="no-underline rounded-1 rgh-highest-rated-comment timeline-comment color-bg-tertiary color-bg-subtle px-2 d-flex flex-items-center">
			{avatar}

			<h3 className="timeline-comment-header-text f5 color-fg-muted text-normal text-italic">
				<strong>Highest-rated comment</strong> — {text}
			</h3>

			<div className="color-fg-muted f6 no-wrap">
				<ArrowDownIcon className="mr-1"/>Jump to comment
			</div>
		</a>,
	);
}

function selectSum(selector: string, container: HTMLElement): number {
	return select.all(selector, container).reduce((sum, element) => sum + looseParseInt(element), 0);
}

function init(): false | void {
	const bestComment = getBestComment();
	if (!bestComment) {
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
	init,
});
