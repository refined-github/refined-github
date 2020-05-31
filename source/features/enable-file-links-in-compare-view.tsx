import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function handlePRMenuOpening(event: delegate.Event): void {
	event.delegateTarget.classList.add('rgh-actionable-link'); // Mark this as processed

	// This solution accounts for:
	// - Branches with slashes in it
	// - PRs opened from the default branch
	const dropdown = event.delegateTarget.nextElementSibling!;
	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const headBranchUrl = select<HTMLAnchorElement>('.commit-ref.head-ref a')!.pathname;
	const filepath = dropdown.closest<HTMLDivElement>('[data-path]')!.dataset.path;
	viewFile.pathname = headBranchUrl + '/' + String(filepath);
}

function handleCompareMenuOpening(event: delegate.Event): void {
	event.delegateTarget.classList.add('rgh-actionable-link'); // Mark this as processed

	const dropdown = event.delegateTarget.nextElementSibling!;
	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const url = new GitHubURL(viewFile.href);
	url.assign({
		branch: select('[title^="compare"]')!.textContent!
	});
	viewFile.href = String(url);

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
		// The following selectors will only exist if you can create a PR. If you can't create a PR you are probably looking at a permalink.
		// It will also exclude repositories you don't have access to.
		() => !select.exists([
			'[name="collab_privs"]', // Allow edits by maintainers
			'.js-issue-sidebar-form' // Sidebar with reviewers/assignees
		])

	],
	init
});
