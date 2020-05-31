import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';

function isPRMenuOpening(event: delegate.Event): void {
	const dropdown = event.delegateTarget.nextElementSibling!;

	// Only if it's not already there
	if (select.exists('.rgh-actionable-link', dropdown)) {
		return;
	}

	// Only enabled on Open/Draft PRs. Editing files doesn't make sense after a PR is closed/merged.
	if (!select.exists('.gh-header-meta [title$="Open"], .gh-header-meta [title$="Draft"]')) {
		return;
	}

	// If you're viewing changes from partial commits, ensure you're on the latest one.
	const isPartialCommits = select.exists('.js-commits-filtered');
	if (isPartialCommits && !select.exists('[aria-label="You are viewing the latest commit"]')) {
		return;
	}

	// This solution accounts for:
	// - Branches with slashes in it
	// - PRs opened from the default branch
	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const url = new GitHubURL(viewFile.href);
	const [user, repository, ...branchParts] = select<HTMLAnchorElement>('.commit-ref.head-ref a')!.title.replace(':', '/').split('/');
	const branch = branchParts.join('/');
	url.assign({
		user,
		repository,
		branch
	});

	viewFile.href = String(url);

	viewFile.classList.add('rgh-actionable-link'); // Mark this as processed
}

function isCompareMenuOpening(event: delegate.Event): void {
	const dropdown = event.delegateTarget.nextElementSibling!;

	// Only if it's not already there
	if (select.exists('.rgh-actionable-link', dropdown)) {
		return;
	}

	const viewFile = select<HTMLAnchorElement>('[data-ga-click^="View file"]', dropdown)!;
	const url = new GitHubURL(viewFile.href);
	url.assign({
		branch: location.pathname.replace(/.+:/, '')
	});
	viewFile.href = String(url);
	viewFile.classList.add('rgh-actionable-link'); // Mark this as processed

	// If the allow maintainers to edit is not available your either comparing a Permalink and the file can't be edited or your comparing a fork you can't edit the file on
	if (!select.exists('[name="collab_privs"]')) {
		return;
	}

	// Fix the edit link
	const editFile = viewFile.cloneNode(true);
	editFile.textContent = 'Edit file';
	editFile.removeAttribute('data-ga-click');
	editFile.href = url.assign({route: 'edit'}).toString();

	// Fix the delete link
	url.assign({
		route: 'delete'
	});
	viewFile.nextElementSibling!.nextElementSibling!.replaceWith(
		<a
			data-skip-pjax
			href={String(url)}
			role="menuitem"
			className="pl-5 dropdown-item menu-item-danger btn-link"
			rel="nofollow"
			aria-label="Delete this file"
			data-ga-click="Delete file, click, location:files_changed_dropdown"
		>
			Delete file
		</a>
	);
}

function init(): void {
	const handleMenuOpening = pageDetect.isCompare() ? isCompareMenuOpening : isPRMenuOpening;
	delegate(document, '.file-header:not([data-file-deleted="true"]) .js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __filebasename,
	description: 'Points the "View file" on compare view pages to the branch instead of the commit, so the Edit/Delete buttons will be enabled on the "View file" page, if needed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/69044026-c5b17d80-0a26-11ea-86ae-c95f89d3669a.png'
}, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
		pageDetect.isCompare
	],
	init
});
