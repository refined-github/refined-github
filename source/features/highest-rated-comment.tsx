import './highest-rated-comment.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import {
	CheckIcon,
	ArrowDownIcon
} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

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
		count >= 10 &&

		// It can't be a controversial comment
		selectSum(negativeReactionsSelector, comment) < count / 2
	) {
		return count;
	}
});

function getBestComment(): HTMLElement | undefined {
	let highest;
	for (const reaction of select.all(positiveReactionsSelector)) {
		const comment = reaction.closest<HTMLElement>(commentSelector)!;
		const positiveReactions = getPositiveReactions(comment);
		if (positiveReactions && (!highest || positiveReactions > highest.count)) {
			highest = {comment, count: positiveReactions};
		}
	}

	return highest?.comment;
}

function highlightBestComment(bestComment: Element): void {
	const avatar = select('.TimelineItem-avatar', bestComment)!;
	avatar.classList.add('flex-column', 'flex-items-center', 'd-md-flex');
	avatar.append(<CheckIcon width={24} height={32} className="mt-4 text-green"/>);

	select('.unminimized-comment', bestComment)!.classList.add('rgh-highest-rated-comment');
	select('.unminimized-comment .timeline-comment-header-text', bestComment)!.before(
		<span
			className="d-flex flex-items-center text-green mr-1 tooltipped tooltipped-n"
			aria-label="This comment has the most positive reactions on this issue."
		>
			<CheckIcon/>
		</span>
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
	const {hash} = select<HTMLAnchorElement>('.js-timestamp', bestComment)!;
	const avatar = select('img.avatar', bestComment)!.cloneNode();

	bestComment.parentElement!.firstElementChild!.after(
		<div className="timeline-comment-wrapper pl-0 my-0">
			<a href={hash} className="no-underline rounded-1 rgh-highest-rated-comment timeline-comment bg-gray px-2 d-flex flex-items-center">
				{avatar}
				<span className="btn btn-sm mr-2">
					<ArrowDownIcon/>
				</span>

				<span className="text-gray timeline-comment-header-text">
					Highest-rated comment: <em>{text}</em>
				</span>
			</a>
		</div>
	);
}

function selectSum(selector: string, container: HTMLElement): number {
	// eslint-disable-next-line unicorn/no-reduce -- The alternative `for` loop is too lengthy for a simple sum
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

void features.add(__filebasename, {
	include: [
		pageDetect.isIssue
	],
	init
});
