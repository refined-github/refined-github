import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import ArrowDownIcon from 'octicon/arrow-down.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {looseParseInt} from '../libs/utils';

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

function init(): false | void {
	const bestComment = getBestComment();
	if (!bestComment) {
		return false;
	}

	highlightBestComment(bestComment);
	linkBestComment(bestComment);
}

function getBestComment(): HTMLElement | null {
	let highest;
	for (const comment of getCommentsWithReactions()) {
		const positiveReactions = getCount(getPositiveReactions(comment));

		// It needs to be upvoted enough times to be considered an useful comment
		if (positiveReactions < 10) {
			continue;
		}

		// Controversial comment, ignore
		const negativeReactions = getCount(getNegativeReactions(comment));
		if (negativeReactions >= positiveReactions / 2) {
			continue;
		}

		if (!highest || positiveReactions > highest.count) {
			highest = {comment, count: positiveReactions};
		}
	}

	if (!highest) {
		return null;
	}

	return highest.comment;
}

function highlightBestComment(bestComment: Element): void {
	select('.unminimized-comment', bestComment)!.classList.add('rgh-highest-rated-comment');
	select('.unminimized-comment .timeline-comment-header-text', bestComment)!.before(
		<span
			className="timeline-comment-label tooltipped tooltipped-n"
			aria-label="This comment has the most positive reactions on this issue."
		>
			Highest-rated comment
		</span>
	);
}

function linkBestComment(bestComment: HTMLElement): void {
	// Find position of comment in thread
	const position = select.all(commentSelector).indexOf(bestComment);
	// Only link to it if it doesn't already appear at the top of the conversation
	if (position >= 3) {
		const text = select('.comment-body', bestComment)!.textContent!.slice(0, 100);
		const {hash} = select<HTMLAnchorElement>('.js-timestamp', bestComment)!;

		// Copy avatar but link it to the comment
		const avatar = select('.TimelineItem-avatar', bestComment)!.cloneNode(true);
		const link = select<HTMLAnchorElement>('[data-hovercard-type="user"]', avatar)!;
		link.removeAttribute('data-hovercard-type');
		link.removeAttribute('data-hovercard-url');
		link.href = hash;

		// We don't copy the exact timeline item structure, so we need to align the avatar with the other avatars in the timeline.
		// TODO: update DOM to match other comments, instead of applying this CSS
		avatar.style.left = '-55px';

		bestComment.parentElement!.firstElementChild!.after((
			<div className="timeline-comment-wrapper pl-0 my-0">
				{avatar}

				<a href={hash} className="no-underline rounded-1 rgh-highest-rated-comment bg-gray px-2 d-flex flex-items-center">
					<span className="btn btn-sm mr-2">
						<ArrowDownIcon/>
					</span>

					<span className="text-gray timeline-comment-header-text">
						Highest-rated comment: <em>{text}</em>
					</span>
				</a>
			</div>
		));
	}
}

function getCommentsWithReactions(): Set<HTMLElement> {
	const comments = getPositiveReactions().map(reaction => reaction.closest<HTMLElement>(commentSelector)!);
	return new Set(comments);
}

function getNegativeReactions(reactionBox?: HTMLElement): HTMLElement[] {
	return select.all(negativeReactionsSelector, reactionBox ?? document);
}

function getPositiveReactions(reactionBox?: HTMLElement): HTMLElement[] {
	return select.all(positiveReactionsSelector, reactionBox ?? document);
}

function getCount(reactions: HTMLElement[]): number {
	return reactions.reduce((count, reaction) => count + looseParseInt(reaction.textContent!), 0);
}

features.add({
	id: __filebasename,
	description: 'Highlights the most useful comment in issues.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58757449-5b238880-853f-11e9-9526-e86c41a32f00.png'
}, {
	include: [
		pageDetect.isIssue
	],
	init
});
