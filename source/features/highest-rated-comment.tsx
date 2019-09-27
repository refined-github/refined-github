import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

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

function getBestComment(): Element | null {
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

function linkBestComment(bestComment: Element): void {
	// Find position of comment in thread
	const position = select.all(commentSelector).indexOf(bestComment as HTMLElement);
	// Only link to it if it doesn't already appear at the top of the conversation
	if (position >= 3) {
		const text = select('.comment-body', bestComment)!.textContent!.slice(0, 100);
		const avatar = select('.timeline-comment-avatar', bestComment)!.cloneNode(true);
		const {hash} = select<HTMLAnchorElement>('.timestamp', bestComment)!;

		bestComment.parentElement!.firstElementChild!.after((
			<div className="timeline-comment-wrapper">
				{avatar}

				<a href={hash} className="no-underline rounded-1 rgh-highest-rated-comment bg-gray px-2 d-flex flex-items-center">
					<span className="btn btn-sm mr-2 pr-1">
						{icons.arrowDown()}
					</span>

					<span className="text-gray timeline-comment-header-text">
						Highest-rated comment: <em>{text}</em>
					</span>
				</a>
			</div>
		));
	}
}

function getCommentsWithReactions(): Set<Element> {
	const comments = getPositiveReactions().map(reaction => reaction.closest(commentSelector)!);
	return new Set(comments);
}

function getNegativeReactions(reactionBox?: Element): Element[] {
	return select.all(negativeReactionsSelector, reactionBox || document);
}

function getPositiveReactions(reactionBox?: Element): Element[] {
	return select.all(positiveReactionsSelector, reactionBox || document);
}

function getCount(reactions: Element[]): number {
	return reactions.reduce((count, reaction) => count + Number(/\d+/.exec(reaction.textContent!)![0]), 0);
}

features.add({
	id: __featureName__,
	description: 'Highlights the most useful comment in issues.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58757449-5b238880-853f-11e9-9526-e86c41a32f00.png',
	include: [
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
