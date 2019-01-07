import select from 'select-dom';
import {h} from 'dom-chef';
import * as icons from '../libs/icons';
import features from '../libs/features';
import {getRepoURL} from '../libs/page-detect';

function init() {
	const comments = select.all('.timeline-comment-header:not(.rgh-timestamp-tree-link)');

	for (const comment of comments) {
		const timestampEl = select('relative-time', comment);
		const timestamp = timestampEl.attributes.datetime.value;
		const href = `/${getRepoURL()}/tree/HEAD@{${timestamp}}`;

		timestampEl.parentNode.after(
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
	id: 'add-time-machine-links-to-comments',
	dependencies: [
		features.isPRConversation,
		features.isIssue
	],
	load: features.onNewComments,
	init
});
