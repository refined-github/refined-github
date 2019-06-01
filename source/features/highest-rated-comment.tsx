import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

function getCount(reaction: HTMLElement): number {
	return Number(reaction.textContent!.match(/\d+/)![0]);
}

function init(): false | void {
	let highest;
	const likes = select.all('.js-discussion .js-timeline-item:nth-child(n+6) [aria-label*="reacted with thumbs up"]');
	for (const like of likes) {
		const count = getCount(like);
		const dislike = select('[aria-label*="reacted with thumbs down"]', like.parentElement!);

		if (dislike && getCount(dislike) >= count / 2) {
			continue; // Controversial comment
		}

		if (!highest || count > highest.count) {
			highest = {like, count};
		}
	}

	if (!highest || highest.count < 10) {
		return false;
	}

	const parent = highest.like.closest('.js-timeline-item')!;
	const {hash} = select<HTMLAnchorElement>('.timestamp', parent)!;
	const text = select('.comment-body', parent)!.textContent!.substring(0, 100);
	const avatar = select('.avatar-parent-child.timeline-comment-avatar', parent)!.cloneNode(true);

	select('.js-discussion')!.prepend((
		<div className="timeline-comment-wrapper">
			{avatar}

			<a href={hash} className="no-underline rounded-1 rgh-highest-rated-comment bg-gray px-2 d-flex flex-items-center">
				<span className="btn btn-sm mr-2 pr-1">
					{icons.arrowDown()}
				</span>

				<span className="text-gray timeline-comment-header-text rgh-highest-rated-comment-text">
					Highest-rated comment: <em>{text}</em>
				</span>
			</a>
		</div>
	));
	select('.comment', parent)!.classList.add('rgh-highest-rated-comment');
}

features.add({
	id: 'highest-rated-comment',
	description: 'Highlight and make a shortcut to most useful comments in issues.',
	screenshot: 'https://i.imgur.com/vXmv0R6.png',
	include: [
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
