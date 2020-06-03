import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import GitBranchIcon from 'octicon/git-branch.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {getCurrentBranch} from '../github-helpers';

/** Rebuilds the "View file" link because it points to the base repo and to the commit, instead of the head repo and its branch */
function handlePRMenuOpening(event: delegate.Event): void {
	event.delegateTarget.classList.add('rgh-actionable-link'); // Mark this as processed

	const dropdown = event.delegateTarget.nextElementSibling!;

	const [, user, repository] = select<HTMLAnchorElement>('.commit-ref.head-ref a')!.pathname.split('/', 3);
	const filePath = dropdown.closest('[data-path]')!.getAttribute('data-path')!;

	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	viewFile.pathname = [user, repository, 'blob', getCurrentBranch(), filePath].join('/'); // Do not replace with `GitHubURL`  #3152 #3111 #2595
}

function handleCompareMenuOpening(event: delegate.Event): void {
	event.delegateTarget.classList.add('rgh-actionable-link'); // Mark this as processed
	const dropdown = event.delegateTarget.nextElementSibling!;

	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
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
	delegate(document, '.file-header:not([data-file-deleted="true"]) .js-file-header-dropdown > summary:not(.rgh-actionable-link)', 'click', handleMenuOpening);
}

features.add({
	id: __filebasename,
	description: 'Points the "View file" on compare view pages to the branch instead of the commit, so the Edit/Delete buttons will be enabled on the "View file" page, if needed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/69044026-c5b17d80-0a26-11ea-86ae-c95f89d3669a.png'
}, {
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
