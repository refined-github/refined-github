import gitBranch from 'octicon/git-branch.svg';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

async function cloneBranch(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void|false> {
	const currentTarget = event.delegateTarget;
	const branchElement = (currentTarget.closest('[data-branch-name]') as HTMLAnchorElement);

	// eslint-disable-next-line no-control-regex
	const invalidBranchName = new RegExp(/^[./]|\.\.|@{|[/.]$|^@$|[~^:\u0000-\u0020\u007F\s?*]/);
	let newBranchName = prompt('Enter the new branch name')?.trim();

	while (invalidBranchName.test(newBranchName as string)) {
		newBranchName = prompt('Unsupported branch name (https://git-scm.com/docs/git-check-ref-format) \nEnter the new branch name', newBranchName)?.trim();
	}

	if (!newBranchName) {
		return;
	}

	const spinner = select('.js-loading-spinner', branchElement)!;
	spinner.hidden = false;
	currentTarget.hidden = true;

	try {
		const getBranchInfo = await api.v3(`repos/${getRepoURL()}/git/refs/heads/${branchElement.dataset.branchName!}`);
		await api.v3(`repos/${getRepoURL()}/git/refs`, {
			method: 'POST',
			body: {
				sha: getBranchInfo.object.sha,
				ref: 'refs/heads/' + newBranchName
			}
		});
		location.reload();
	} catch (error) {
		console.error(error);
		alert('Creating branch failed. See console for details');
	}

	spinner.hidden = true;
	currentTarget.hidden = false;
}

function changeIconVisibility(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	const currentTarget = event.delegateTarget;
	const branchElement = (currentTarget.closest('[data-branch-name]') as HTMLAnchorElement);
	select('.rgh-clone-branch', branchElement)!.hidden = currentTarget.classList.contains('js-branch-destroy');
}

function init(): void | false {
	// Is the user does not have rights to create a branch
	if (!select.exists('[aria-label="Delete this branch"]')) {
		return false;
	}

	for (const branch of select.all('[aria-label="Delete this branch"]')) {
		branch.closest('.Details-content--shown')!.after(
			<a
				aria-label="Clone this branch"
				className="link-gray no-underline tooltipped tooltipped-e d-inline-block ml-3 rgh-clone-branch"
			>
				{gitBranch()}
			</a>
		);
	}

	delegate('.rgh-clone-branch', 'click', cloneBranch);
	delegate('.js-branch-destroy, .js-branch-restore', 'click', changeIconVisibility);
}

features.add({
	id: __featureName__,
	description: 'Clone a branch from the branches list',
	screenshot: 'https://user-images.githubusercontent.com/16872793/76715710-e0111480-6703-11ea-8b47-6c428e83a4e3.png',
	include: [
		features.isBranches
	],
	load: features.onAjaxedPages,
	init
});
