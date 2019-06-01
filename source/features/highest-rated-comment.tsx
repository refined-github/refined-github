import './highest-rated-comment.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

type Props = {
	id: string;
	text: string;
	avatar: HTMLImageElement;
}

const element = ({id, text, avatar}: Props): Node => (
	<div className="timeline-comment-wrapper">
		{avatar}

		<a href={`#${id}`} className="no-underline">
			<div className="bg-white details-reset rounded-1 rgh-highest-rated-comment">
				<div className="bg-gray border-bottom-0 px-2 py-0">
					<div className="d-flex flex-items-center">
						<span className="btn btn-sm mr-2 pr-1">
							{icons.arrowDown()}
						</span>

						<div className="text-gray timeline-comment-header-text rgh-highest-rated-comment-text">
							Highest-rated comment: <em>{text}</em>
						</div>
					</div>
				</div>
			</div>
		</a>
	</div>
);

function getCount(reaction: HTMLElement): number {
	return Number(reaction.textContent!.match(/\d+/)![0]);
}

function init(): void {
	let highest;
	const $likes = select.all('.js-discussion .js-timeline-item:nth-child(n+6) [aria-label*="reacted with thumbs up"]');
	for (const $like of $likes) {
		const count = getCount($like);
		const $dislike = select('[aria-label*="reacted with thumbs down"]', $like.parentElement!);

		if ($dislike && getCount($dislike) >= count / 2) {
			continue; // Controversial comment
		}

		if (!highest) {
			highest = {$like, count};
		} else if (count > highest.count) {
			highest = {$like, count};
		}
	}

	if (!highest || highest.count < 10) {
		return;
	}

	const $parent = highest.$like.closest('.js-timeline-item')!;
	const $comment = select('.comment', $parent)!;
	const {id} = select('.timeline-comment-group', $parent)!;
	const text = select('.comment-body', $parent)!.textContent!.substring(0, 100);
	const $avatar = select('.avatar-parent-child.timeline-comment-avatar', $parent)! as HTMLImageElement;
	const avatar = $avatar.cloneNode(true) as HTMLImageElement;
	const props: Props = {id, text, avatar};

	select('.js-discussion')!.prepend(element(props));
	$comment.classList.add('rgh-highest-rated-comment');
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
