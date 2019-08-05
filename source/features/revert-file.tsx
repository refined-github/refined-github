import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import postForm from '../libs/post-form';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';
import {isEnterprise} from '../libs/page-detect';

/**
@param pathname Like '/sindresorhus/refined-github/blob/currentcommit/readme.md'
*/
function createRawUrlAtCommit(pathname: string, commit: string): string {
	// eslint-disable-next-line unicorn/no-unreadable-array-destructuring
	const [, user, repo, /* 'blob' */, /* currentCommit */, ...file] = pathname.split('/');
	if (isEnterprise()) {
		return `${location.origin}/${user}/${repo}/raw/${commit}/${file.join('/')}`;
	}

	return `https://raw.githubusercontent.com/${user}/${repo}/${commit}/${file.join('/')}`;
}

async function handleRevertFileClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const menuItem = event.currentTarget;
	menuItem.textContent = 'Reverting…';
	event.preventDefault();
	event.stopPropagation();

	const {ownerName, repoName} = getOwnerAndRepo();
	try {
		const editFileLink = menuItem.previousElementSibling as HTMLAnchorElement;
		const viewFileLink = menuItem.parentElement!.querySelector<HTMLAnchorElement>('[data-ga-click^="View file"]')!;
		// The `a` selector skips the broken Delete link on some pages. GitHub's bug.
		const deleteFileLink = menuItem.parentElement!.querySelector<HTMLAnchorElement>('a[aria-label^="Delete this"]')!;

		// Prefetch form asynchronously. Only await it later when needed
		const editFormPromise = fetchDom<HTMLFormElement>(editFileLink.href, '#new_blob');

		// Get the real base commit of this PR, not the HEAD of base branch
		const {repository: {pullRequest: {baseRefOid}}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${getDiscussionNumber()}) {
					baseRefOid
				}
			}
		}`);

		// Fetch file source
		const response = await fetch(createRawUrlAtCommit(viewFileLink.pathname, baseRefOid));
		if (!response.ok) {
			// The file was added by this PR. Delete the file instead
			const deleteForm = await fetchDom<HTMLFormElement>(deleteFileLink.href, '#new_blob');
			await postForm(deleteForm);
			return;
		}

		const editForm = await editFormPromise;
		editForm.elements.value.value = await response.text(); // Revert content (`value` is the name of the file content field)
		editForm.elements.message.value = (editForm.elements.message as HTMLInputElement).placeholder.replace('Update', 'Revert');
		await postForm(editForm);

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		console.log(error);
		menuItem.disabled = true;
		menuItem.style.whiteSpace = 'pre-wrap';
		menuItem.textContent = 'Revert failed. See console for errors';
	}
}

async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling!;

	const editFile = select<HTMLAnchorElement>('[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('.rgh-revert-file', dropdown)) {
		return;
	}

	editFile.after(
		<button
			className="pl-5 dropdown-item btn-link rgh-revert-file"
			role="menuitem"
			type="button"
			onClick={handleRevertFileClick}
		>
			Revert file
		</button>
	);
}

function init(): void {
	delegate('#files', '.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Adds button to revert all the changes to a file in a PR.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/60279449-a610a000-9933-11e9-8b40-fe8b935dc7ad.gif',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
