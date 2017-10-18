import select from 'select-dom';
import {h} from 'dom-chef';
import {getOwnerAndRepo} from './page-detect';

const {ownerName, repoName} = getOwnerAndRepo();

const getSHABeforeTimestamp = async timestamp => {
	const url = `https://api.github.com/repos/${ownerName}/${repoName}/commits?until=${timestamp}`;
	const data = await fetch(url).then(res => res.json());

	if (data.length > 0) {
		return data[0].sha;
	}
};

export default async () => {
	const newTimestamps = select.all(`.new-discussion-timeline .timestamp:not(.refined-github-comment-browse-files)`);

	newTimestamps.forEach(async timestampLink => {
		const timestampValue = select('relative-time', timestampLink).attributes.datetime.value;

		const openTree = async ({target}) => {
			target.textContent = 'Loading...';

			let sha;

			try {
				sha = await getSHABeforeTimestamp(timestampValue);
			} catch (err) {
				target.textContent = 'Error fetching commit!';
				console.log(err);
				return;
			}

			if (!sha) {
				target.textContent = 'No commits before this comment!';
				return;
			}

			location.href = `https://github.com/${ownerName}/${repoName}/tree/${sha}`;
		};

		timestampLink.insertAdjacentElement('afterEnd',
			<span>
				&nbsp;
				<button onClick={openTree}>
					Browse files
				</button>
			</span>
		);

		timestampLink.classList.add('refined-github-comment-browse-files');
	});
};
