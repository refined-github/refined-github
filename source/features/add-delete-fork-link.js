import {h} from 'dom-chef';
import select from 'select-dom';
import onNewComments from '../libs/on-new-comments';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

function addLink() {
	const postMergeDescription = select('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			postMergeDescription.append(
				<a id="refined-github-delete-fork-link" href={`/${forkPath}/settings`}>
					Delete fork
				</a>
			);
		}
	}
}

export default function () {
	addLink();
	onNewComments(addLink);
}
