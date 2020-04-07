import React from 'dom-chef';
import select from 'select-dom';
import gitBranch from 'octicon/git-branch.svg';
import insertTextTextarea from 'insert-text-textarea';
import delegate from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import loadingIcon from '../libs/icon-loading';
import {getRepoURL, getRepoGQL} from '../libs/utils';

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
	const branchElement = cloneButton.closest<HTMLElement>('[data-branch-name]')!;

	const currentBranch = getBranchBaseSha(branchElement.dataset.branchName!);
	let newBranchName = prompt('Enter the new branch name')?.trim();

	const spinner = loadingIcon();
	spinner.classList.add('ml-2');
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

	const searchField = select<HTMLInputElement>('.js-branch-search-field')!;
	searchField.select();
	insertTextTextarea(searchField, newBranchName);
}

function init(): void | false {
	const deleteIcons = select.all('[aria-label="Delete this branch"]');
	// Is the user does not have rights to create a branch
	if (deleteIcons.length === 0) {
		return false;
	}

	for (const branch of deleteIcons) {
		branch.closest('.js-branch-destroy')!.before(
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
	id: __featureName__,
	description: 'Clone a branch from the branches list.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/76802029-2a020500-67ad-11ea-95dc-bee1b1352976.png'
}, {
	include: [
		features.isBranches
	],
	load: features.onAjaxedPages,
	init
});
