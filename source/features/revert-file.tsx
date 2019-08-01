import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import postForm from '../libs/post-form';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';

async function handleRevertFileClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const menuItem = event.currentTarget;
	menuItem.textContent = 'Reverting…';
	event.preventDefault();
	event.stopPropagation();

	const {ownerName, repoName} = getOwnerAndRepo();
	try {
		// Prefetch form asynchronously. Only await it later when needed
		const editFormPromise = fetchDom<HTMLFormElement>((menuItem.previousElementSibling as HTMLAnchorElement).href, '#new_blob');

		// Get the real base commit of this PR, not the HEAD of base branch
		const {repository: {pullRequest: {baseRefOid}}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${getDiscussionNumber()}) {
					baseRefOid
				}
			}
		}`);

		const filePath = (menuItem.closest('[data-path]') as HTMLElement).dataset.path!;

		const {repository: {file}} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				file: object(expression: "${baseRefOid}:${filePath}") {
					... on Blob {
						isTruncated
						text
					}
				}
			}
		}`);

		if (!file) {
			// The file was added by this PR. Click the "Delete file" link instead.
			// The `a` selector skips the broken Delete link on some pages. GitHub's bug.
			// TODO: load it and submit the form automatically via ajax
			select('[aria-label^="Delete this"]', menuItem.parentElement!)!.click();
			return;
		}

		if (file.isTruncated) {
			menuItem.disabled = true;
			menuItem.textContent = 'Revert failed: File too big';
			return;
		}

		const editForm = await editFormPromise;
		editForm.elements.value.value = file.text; // Revert content (`value` is the name of the file content field)
		await postForm(editForm);

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		console.log(error);
		menuItem.disabled = true;
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
			style={{whiteSpace: 'pre-wrap'}}
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
