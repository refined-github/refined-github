import gitBranch from 'octicon/git-branch.svg';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

async function cloneBranch(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void|false> {
	const currentTarget = event.delegateTarget;
	const branchElement = (currentTarget.closest('[data-branch-name]') as HTMLAnchorElement);
	const newBranchName = prompt('Enter the new branch name');
	if (!newBranchName) {
		return false;
	}

	const spinner = select('.js-loading-spinner', branchElement)!;
	spinner.hidden = false;
	currentTarget.hidden = true;

	const [user, repo] = getCleanPathname().split('/');
	try {
		const getBranchInfo = await api.v3(`repos/${user}/${repo}/git/refs/heads/${branchElement.dataset.branchName!}`);
		await api.v3(`repos/${user}/${repo}/git/refs`, {
			method: 'POST',
			body: {
				sha: String(getBranchInfo.object.sha),
				ref: 'refs/heads/' + newBranchName
			}
		});
		branchElement.after(branchElement.cloneNode(true));
	} catch (error) {
		const errorMessage = JSON.parse(error.message.slice(Math.max(0, error.message.indexOf('{')))).message;
		alert(errorMessage);
	}

	spinner.hidden = true;
	currentTarget.hidden = false;
}

async function init(): Promise<void> {
	// Is the user does not have rights to create a branch
	if (!select.exists('[aria-label="Delete this branch"]')) {
		return;
	}

	for (const branch of select.all('[aria-label="Delete this branch"]')) {
		branch.closest('.Details-content--shown')!.after(
			<a
				aria-label="Clone Branch"
				className="link-hover-blue no-underline tooltipped tooltipped-e d-inline-block ml-1 rgh-clone-branch"
			>
				{gitBranch()}
			</a>
		);
	}

	delegate('.rgh-clone-branch', 'click', cloneBranch);
}

features.add({
	id: __featureName__,
	include: [
		features.isBranches
	],
	load: features.onAjaxedPages,
	init
});
