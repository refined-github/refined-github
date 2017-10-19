import select from 'select-dom';
import {h} from 'dom-chef';
import {getOwnerAndRepo} from './page-detect';
import fetchAPI from './api';

import * as icons from './icons';

const {ownerName, repoName} = getOwnerAndRepo();

const getSHABeforeTimestamp = async timestamp => {
	const data = await fetchAPI(`repos/${ownerName}/${repoName}/commits?until=${timestamp}&per_page=1`);

	if (data.length > 0) {
		return data[0].sha;
	}
};

const openTree = async ({currentTarget}) => {
	currentTarget.firstChild.replaceWith(icons.clock());

	const timestampValue = currentTarget.dataset.timestamp;
	const sha = await getSHABeforeTimestamp(timestampValue).catch(console.error);

	if (sha) {
		location.href = `/${ownerName}/${repoName}/tree/${sha}`;
	} else {
		currentTarget.firstChild.replaceWith(icons.stop());
	}
};

export default async () => {
	const comments = select.all('.timeline-comment-header:not(.rgh-timestamp-tree-link)');

	for (const comment of comments) {
		const timestampEl = select('relative-time', comment);
		const timestampValue = timestampEl.attributes.datetime.value;

		timestampEl.parentNode.after(
			<span>
				&nbsp;
				<button onClick={openTree} data-timestamp={timestampValue} type="button" class="timeline-comment-action btn-link rgh-timestamp-button">
					{icons.code()}
				</button>
			</span>
		);

		comment.classList.add('rgh-timestamp-tree-link');
	}
};
