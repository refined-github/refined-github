import select from 'select-dom';
import React from 'dom-chef';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/utils';

function init() {
	const comments = select.all('.timeline-comment-header:not(.rgh-timestamp-tree-link)');

	for (const comment of comments) {
		const timestampEl = select('relative-time', comment.closest('.discussion-item-review') || comment);
		const timestamp = timestampEl.attributes['datetime'].value; // eslint-disable-line dot-notation
		const href = `/${getRepoURL()}/tree/HEAD@{${timestamp}}`;

		timestampEl.parentElement.after(
			' ',
			<a
				href={href}
				class="timeline-comment-action btn-link rgh-timestamp-button tooltipped tooltipped-n"
				aria-label="View repo at the time of this comment"
			>
				{icons.code()}
			</a>
		);

		comment.classList.add('rgh-timestamp-tree-link');
	}
}

features.add({
	id: 'comments-time-machine-links',
	description: 'Browse a repository at the time of each comment',
	include: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onNewComments,
	init
});
