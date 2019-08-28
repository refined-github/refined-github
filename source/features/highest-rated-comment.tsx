import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

// `.js-timeline-item` gets the nearest comment excluding the very first comment (OP post)
const COMMENT_SELECTOR = '.js-timeline-item';

const positiveReactions = [
	'[aria-label*="reacted with thumbs up"]',
	'[aria-label*="reacted with hooray"]',
	'[aria-label*="reacted with heart"]'
];

const negativeReactions = [
	'[aria-label*="reacted with thumbs down"]'
];

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
	for (const posReaction of getWatchedReactions()) {
		const nearestComment = posReaction.closest(COMMENT_SELECTOR) as HTMLElement;

		const likes = getPositiveReactions(nearestComment);
		const dislikes = getNegativeReactions(nearestComment);

		const likeCount = getCount(likes);
		const dislikeCount = getCount(dislikes);

		// Controversial comment, ignore
		if (dislikeCount >= likeCount / 2) {
			continue;
		}

		if (!highest || likeCount > highest.count) {
			highest = {nearestComment, count: likeCount};
		}
	}

	// If count is not high enough don't bother telling user
	if (!highest || highest.count < 10 || !highest.nearestComment) {
		return null;
	}

	return highest.nearestComment;
}

function highlightBestComment(bestComment: HTMLElement): void {
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
	const position = select.all('.js-timeline-item').indexOf(bestComment);
	// Only insert element if there are enough comments in the thread to warrant it
	if (position >= 3) {
		const text = select('.comment-body', bestComment)!.textContent!.substring(0, 100);
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

function getWatchedReactions(): HTMLElement[] {
	return positiveReactions.flatMap(reaction => select.all(`${COMMENT_SELECTOR} ${reaction}`));
}

function getNegativeReactions(reactionBox: HTMLElement): HTMLElement[] {
	return negativeReactions.flatMap(reaction => select.all(`${reaction}`, reactionBox));
}

function getPositiveReactions(reactionBox: HTMLElement): HTMLElement[] {
	return positiveReactions.flatMap(reaction => select.all(`${reaction}`, reactionBox));
}

function getCount(reactions: HTMLElement[]): number {
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
