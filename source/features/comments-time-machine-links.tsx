import select from 'select-dom';
import React from 'dom-chef';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/utils';

function init() {
	const comments = select.all('.timeline-comment-header:not(.rgh-timestamp-tree-link)');

	for (const comment of comments) {
		const timestampEl = select('relative-time', comment.closest('.discussion-item-review') || comment)!;
		const timestamp = timestampEl.attributes.datetime.value;
    const humanDate = timestampEl.textContent;

		const href = `/${getRepoURL()}/tree/HEAD@{${timestamp}}`;

		timestampEl.parentElement!.after(
			' ',
			<a
				href={href}
				className="muted-link tooltipped tooltipped-n"
				aria-label={`View repo ${humanDate}`}
			>
				{icons.code()}
			</a>
		);

		const links = select.all<HTMLAnchorElement>(`
			[href^="${location.origin}"][href*="/blob/"],
			[href^="${location.origin}"][href*="/tree/"]
		`, comment.closest('.comment')!);
		for (const link of links) {
			const linkParts = link.pathname.split('/');
			// Skip permalinks
			if (/^[0-9a-f]{40}$/.test(linkParts[4])) {
				continue;
			}

			linkParts[4] = `HEAD@{${timestamp}}`; // Change git ref
			link.after(
				' ',
				<a
					href={linkParts.join('/')}
					className="muted-link tooltipped tooltipped-n"
					aria-label={`View default branch ${humanDate}`}
				>
					{icons.clock()}
				</a>
			);
		}

		comment.classList.add('rgh-timestamp-tree-link');
	}
}

features.add({
	id: 'comments-time-machine-links',
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
