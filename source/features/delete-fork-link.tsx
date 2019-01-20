import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init() {
	const currentBranch = select('#partial-pull-merging .merge-branch-description .commit-ref');
	if (!currentBranch) {
		return false;
	}

	const [forkPath] = currentBranch.title.split(':');

	if (forkPath === getRepoURL()) {
		return false;
	}

	currentBranch.parentElement.append(
		<a id="refined-github-delete-fork-link" href={`/${forkPath}/settings`}>
			Delete fork
		</a>
	);
}

features.add({
	id: 'delete-fork-link',
	include: [
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
