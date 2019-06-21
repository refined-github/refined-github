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
	// `.js-timeline-item` excludes the very first comment
	for (const like of select.all('.js-timeline-item [aria-label*="reacted with thumbs up"]')) {
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

	const event = highest.like.closest('.js-timeline-item')!;
	const text = select('.comment-body', event)!.textContent!.substring(0, 100);
	const avatar = select('.timeline-comment-avatar', event)!.cloneNode(true);
	const {hash} = select<HTMLAnchorElement>('.timestamp', event)!;

	select('.unminimized-comment', event)!.classList.add('rgh-highest-rated-comment');

	const position = select.all('.js-comment').indexOf(highest.like.closest('.js-comment') as HTMLElement);
	if (position >= 4) {
		event.parentElement!.firstElementChild!.after((
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

features.add({
	id: 'highest-rated-comment',
	description: 'The most useful comment in issues is highlighted.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58757449-5b238880-853f-11e9-9526-e86c41a32f00.png',
	include: [
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
