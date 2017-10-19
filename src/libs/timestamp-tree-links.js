import select from 'select-dom';
import {h} from 'dom-chef';
import {getOwnerAndRepo} from './page-detect';
import * as icons from './icons';

const {ownerName, repoName} = getOwnerAndRepo();

const getSHABeforeTimestamp = async timestamp => {
	const url = `https://api.github.com/repos/${ownerName}/${repoName}/commits?until=${timestamp}&per_page=1`;
	const data = await fetch(url).then(res => res.json());

	if (data.length > 0) {
		return data[0].sha;
	}
};

const openTree = async ({target}) => {
	target.firstChild.replaceWith(icons.clock());

	const timestampValue = target.dataset.timestamp;
	const sha = await getSHABeforeTimestamp(timestampValue).catch(console.error);

	if (sha) {
		location.href = `/${ownerName}/${repoName}/tree/${sha}`;
	} else {
		target.firstChild.replaceWith(icons.stop());
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
				<button onClick={openTree} data-timestamp={timestampValue} type="button" class="timeline-comment-action btn-link refined-github-timestamp-button">
					{icons.code()}
				</button>
			</span>
		);

		comment.classList.add('rgh-timestamp-tree-link');
	}
};
