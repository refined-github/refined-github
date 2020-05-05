import React from 'dom-chef';
import select from 'select-dom';
import gitBranch from 'octicon/git-branch.svg';
import delegate from 'delegate-it';
import * as textFieldEdit from 'text-field-edit';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import LoadingIcon from '../libs/icon-loading';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import observeElement from '../libs/simplified-element-observer';

const getBranchBaseSha = async (branchName: string): Promise<string> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			ref(qualifiedName: "${branchName}") {
				target {
					oid
				}
			}
		}
	`);

	return repository.ref.target.oid;
};

async function createBranch(newBranchName: string, baseSha: string): Promise<true | string> {
	const response = await api.v3(`repos/${getRepoURL()}/git/refs`, {
		method: 'POST',
		body: {
			sha: baseSha,
			ref: 'refs/heads/' + newBranchName
		},
		ignoreHTTPStatus: true
	});

	return response.ok || response.message;
}

async function cloneBranch(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	const cloneButton = event.delegateTarget;
	const branchName = cloneButton.closest('[branch]')!.getAttribute('branch')!;

	const currentBranch = getBranchBaseSha(branchName);
	let newBranchName = prompt('Enter the new branch name')?.trim();

	const spinner = <LoadingIcon className="ml-2"/>;

	while (newBranchName) {
		cloneButton.replaceWith(spinner);
		// eslint-disable-next-line no-await-in-loop
		const result = await createBranch(newBranchName, await currentBranch);
		spinner.replaceWith(cloneButton);

		if (result === true) {
			break;
		}

		newBranchName = prompt(result.replace('refs/heads/' + newBranchName, 'This') + '\nEnter the new branch name', newBranchName)?.trim();
	}

	if (!newBranchName) {
		return;
	}

	textFieldEdit.set(
		select<HTMLInputElement>('[name="query"]')!,
		newBranchName
	);
}

function init(): void | false {
	const deleteIcons = select.all('branch-filter-item-controller .octicon-trashcan');
	// If the user does not have rights to delete a branch, they can’t create one either
	if (deleteIcons.length === 0) {
		return false;
	}

	for (const deleteIcon of deleteIcons) {
		// Branches with open PRs use `span`, the others use `form`
		deleteIcon.closest('form, span')!.before(
			<button
				type="button"
				aria-label="Clone this branch"
				className="link-gray btn-link tooltipped tooltipped-nw ml-3 rgh-clone-branch"
			>
				{gitBranch()}
			</button>
		);
	}

	delegate(document, '.rgh-clone-branch', 'click', cloneBranch);
}

features.add({
	id: __filebasename,
	description: 'Clone a branch from the branches list.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/76802029-2a020500-67ad-11ea-95dc-bee1b1352976.png'
}, {
	include: [
		pageDetect.isBranches
	],
	init: () => {
		observeElement('[data-target="branch-filter-controller.results"]', init);
	}
});
