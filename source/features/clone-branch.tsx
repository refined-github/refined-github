import gitBranch from 'octicon/git-branch.svg';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

// Taken from https://stackoverflow.com/questions/3651860/which-characters-are-illegal-within-a-branch-name#comment71900602_3651867
const invalidBranchName = new RegExp(/^[./]|\.\.|@{|[/.]$|^@$|[~^:\u0000-\u0020\u007F\s?*]/); // eslint-disable-line no-control-regex
async function cloneBranch(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): Promise<void> {
	const currentTarget = event.delegateTarget;
	const branchElement = currentTarget.closest('[data-branch-name]') as HTMLAnchorElement;

	let newBranchName = prompt('Enter the new branch name')?.trim();

	while (invalidBranchName.test(newBranchName!)) {
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
		const redirectURL = new URL(location.href);
		redirectURL.pathname = redirectURL.pathname.endsWith('/all') ? redirectURL.pathname : redirectURL.pathname + '/all';
		const search = new URLSearchParams(location.search);
		search.set('query', newBranchName);
		redirectURL.search = String(search);
		location.replace(String(redirectURL));
	} catch (error) {
		console.error(error);
		alert('Creating branch failed. See console for details');
	}

	spinner.hidden = true;
	currentTarget.hidden = false;
}

function init(): void | false {
	// Is the user does not have rights to create a branch
	const branchElement = select.all('[aria-label="Delete this branch"]');
	if (branchElement.length === 0) {
		return false;
	}

	for (const branch of branchElement) {
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

	delegate('.rgh-clone-branch', 'click', cloneBranch);
}

features.add({
	id: __featureName__,
	description: 'Clone a branch from the branches list',
	screenshot: 'https://user-images.githubusercontent.com/16872793/76802029-2a020500-67ad-11ea-95dc-bee1b1352976.png',
	include: [
		features.isBranches
	],
	load: features.onAjaxedPages,
	init
});
