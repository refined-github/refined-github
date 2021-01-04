import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {GitBranchIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {getCurrentBranch, getPRHeadRepo} from '../github-helpers';

/** Rebuilds the "View file" link because it points to the base repo and to the commit, instead of the head repo and its branch */
function handlePRMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-actionable-link'); // Mark this as processed
	const filePath = dropdown.closest('[data-path]')!.getAttribute('data-path')!;

	const viewFile = select('a[data-ga-click^="View file"]', dropdown)!;
	viewFile.pathname = [getPRHeadRepo()!.nameWithOwner, 'blob', getCurrentBranch()!, filePath].join('/'); // Do not replace with `GitHubURL`  #3152 #3111 #2595
}

function handleCompareMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	dropdown.classList.add('rgh-actionable-link'); // Mark this as processed

	const viewFile = select('a[data-ga-click^="View file"]', dropdown)!;
	const branch = select('[title^="compare"]')!.textContent!;
	viewFile.before(
		<div className="dropdown-header pl-5">
			<GitBranchIcon className="ml-n3 pr-1" height={13}/>
			{branch}
		</div>
	);

	const url = new GitHubURL(viewFile.href);
	viewFile.href = url.assign({branch}).toString();

	// Fix the edit link
	const editFile = viewFile.cloneNode(true);
	editFile.textContent = 'Edit file';
	editFile.removeAttribute('data-ga-click');
	editFile.href = url.assign({route: 'edit'}).toString();
	select('[aria-label$="to make changes."]', dropdown)!.replaceWith(editFile);

	// Fix the delete link
	const deleteFile = editFile.cloneNode(true);
	deleteFile.textContent = 'Delete file';
	deleteFile.classList.add('menu-item-danger');
	deleteFile.href = url.assign({route: 'delete'}).toString();
	select('[aria-label$="delete this file."]', dropdown)!.replaceWith(deleteFile);
}

function init(): void {
	const handleMenuOpening = pageDetect.isCompare() ? handleCompareMenuOpening : handlePRMenuOpening;
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.file-header:not([data-file-deleted="true"]) .js-file-header-dropdown:not(.rgh-actionable-link)', 'toggle', handleMenuOpening, true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	exclude: [
		// Only enabled on Open/Draft PRs. Editing files doesn't make sense after a PR is closed/merged.
		() => !select.exists('.gh-header-meta [title$="Open"], .gh-header-meta [title$="Draft"]'),
		// If you're viewing changes from partial commits, ensure you're on the latest one.
		() => select.exists('.js-commits-filtered') && !select.exists('[aria-label="You are viewing the latest commit"]')
	],
	init
}, {
	include: [
		pageDetect.isCompare
	],
	exclude: [
		// Only enable if you can create a PR or view an existing PR, if you cant you are probably looking at a permalink.
		() => !select.exists('.existing-pull-button, [data-ga-click*="text:Create pull request"]')
	],
	init
});
