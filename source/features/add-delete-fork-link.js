import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default function () {
	const canDeleteFork = select.exists('.reponav-item [data-selected-links~="repo_settings"]');
	const postMergeDescription = select('#partial-pull-merging .merge-branch-description');

	if (canDeleteFork && postMergeDescription) {
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
