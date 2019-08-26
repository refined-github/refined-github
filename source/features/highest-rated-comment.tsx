import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';


function init(): false | void {
	let highest;

	// `.js-timeline-item` excludes the very first comment
	for (const comment of getComments()) {
		const likes = getPositiveReactions(comment);
		const dislikes = getNegativeReactions(comment);

		const likeCount = getCount(likes);
		const dislikeCount = getCount(dislikes);

		if (dislikeCount >= likeCount / 2) {
			continue; // Controversial comment
		}

		if (!highest || likeCount > highest.count) {
			highest = {comment, count: likeCount};
		}
	}

	if (!highest || highest.count < 10) {
		return false;
	}

	const event = highest.comment.closest('.js-timeline-item')!;
	if(!event) {
		return false;
	}

	const text = select('.comment-body', event)!.textContent!.substring(0, 100);
	const avatar = select('.timeline-comment-avatar', event)!.cloneNode(true);
	const {hash} = select<HTMLAnchorElement>('.timestamp', event)!;

	select('.unminimized-comment', event)!.classList.add('rgh-highest-rated-comment');
	select('.unminimized-comment .timeline-comment-header-text', event)!.before(
		<span
			className="timeline-comment-label tooltipped tooltipped-n"
			aria-label="This comment has the most positive reactions on this issue."
		>
			Highest-rated comment
		</span>
	);

	const position = select.all('.js-comment').indexOf(highest.comment.closest('.js-comment') as HTMLElement);
	if (position >= 4) {
		event.parentElement!.firstElementChild!.after((
			<div className="timeline-comment-wrapper">
				{avatar}

				<a href={hash}
				   className="no-underline rounded-1 rgh-highest-rated-comment bg-gray px-2 d-flex flex-items-center">
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

function getComments(): HTMLElement[] {
	// Skip first comment because that is OP post
	return select.all('.js-comment').slice(1);
}

function getNegativeReactions(reactionBox: HTMLElement): HTMLElement[] {
	return select.all('[aria-label*="reacted with thumbs down"]', reactionBox);
}

function getPositiveReactions(reactionBox: HTMLElement): HTMLElement[] {
	return select.all('[aria-label*="reacted with thumbs up"]', reactionBox)
		.concat(select.all('[aria-label*="reacted with hooray"]', reactionBox))
		.concat(select.all('[aria-label*="reacted with heart"]', reactionBox))
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
