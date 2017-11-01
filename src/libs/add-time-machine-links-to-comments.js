import select from 'select-dom';
import {h} from 'dom-chef';

import * as icons from './icons';

export default async () => {
	const comments = select.all('.timeline-comment-header:not(.rgh-timestamp-tree-link)');

	for (const comment of comments) {
		const timestampEl = select('relative-time', comment);
		const timestamp = timestampEl.attributes.datetime.value;
		const href = `https://github.com/sindresorhus/refined-github/tree/HEAD@{${timestamp}}`;

		timestampEl.parentNode.after(
			<span>
				&nbsp;
				<a href={href} class="timeline-comment-action btn-link rgh-timestamp-button">
					{icons.code()}
				</a>
			</span>
		);

		comment.classList.add('rgh-timestamp-tree-link');
	}
};
