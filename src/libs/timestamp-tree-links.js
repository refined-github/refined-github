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

export default async () => {
	const newTimestamps = select.all(`.new-discussion-timeline .timestamp:not(.refined-github-comment-browse-files)`);

	for (const timestampLink of newTimestamps) {
		const timestampValue = select('relative-time', timestampLink).attributes.datetime.value;

		const openTree = async ({target}) => {
			target.firstChild.replaceWith(icons.clock());

			const sha = await getSHABeforeTimestamp(timestampValue).catch(console.error);

			if (sha) {
				location.href = `https://github.com/${ownerName}/${repoName}/tree/${sha}`;
			} else {
				target.firstChild.replaceWith(icons.stop());
			}
		};

		timestampLink.insertAdjacentElement('afterEnd',
			<span>
				&nbsp;
				<button onClick={openTree} type="button" class="timeline-comment-action btn-link refined-github-timestamp-button">
					{icons.code()}
				</button>
			</span>
		);

		timestampLink.classList.add('refined-github-comment-browse-files');
	}
};
