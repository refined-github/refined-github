import {h} from 'dom-chef';
import select from 'select-dom';
import onNewComments from '../libs/on-new-comments';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

function addLink() {
	const currentBranch = select('#partial-pull-merging .merge-branch-description .commit-ref');
	if (!currentBranch) {
		return;
	}

	const [forkPath] = currentBranch.title.split(':');

	if (forkPath !== repoUrl) {
		currentBranch.parentElement.append(
			<a id="refined-github-delete-fork-link" href={`/${forkPath}/settings`}>
				Delete fork
			</a>
		);
	}
}

export default function () {
	addLink();
	onNewComments(addLink);
}
