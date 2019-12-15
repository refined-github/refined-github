import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import postForm from '../libs/post-form';
import {getDiscussionNumber, getRepoGQL, getRepoURL, getCurrentBranch} from '../libs/utils';

function showError(menuItem: HTMLButtonElement, error: string): void {
	menuItem.disabled = true;
	menuItem.style.background = 'none'; // Disables hover background color
	menuItem.textContent = error;
}

/**
Get the current base commit of this PR. It should change after rebases and merges in this PR.
This value is not consistently available on the page (appears in `/files` but not when only 1 commit is selected)
*/
const getBaseReference = onetime(async (): Promise<string> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			pullRequest(number: ${getDiscussionNumber()!}) {
				baseRefOid
			}
		}
	`);
	return repository.pullRequest.baseRefOid;
});

async function getFile(menuItem: Element): Promise<{isTruncated: boolean; text: string} | null> {
	const filePath = menuItem.closest<HTMLElement>('[data-path]')!.dataset.path!;
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			file: object(expression: "${await getBaseReference()}:${filePath}") {
				... on Blob {
					isTruncated
					text
				}
			}
		}
	`);
	return repository.file;
}

async function deleteFile(menuItem: Element): Promise<void> {
	menuItem.textContent = 'Deleting…';

	const deleteFileLink = select<HTMLAnchorElement>('a[aria-label^="Delete this"]', menuItem.parentElement!)!;
	const form = await fetchDom<HTMLFormElement>(deleteFileLink.href, '#new_blob');
	await postForm(form!);
}

async function commitFileContent(menuItem: Element, content: string): Promise<void> {
	let {pathname} = (menuItem.previousElementSibling as HTMLAnchorElement);
	// Check if file was deleted by PR
	if (menuItem.closest('[data-file-deleted="true"]')) {
		menuItem.textContent = 'Undeleting…';
		const filePath = pathname.split('/')[5]; // The URL was something like /$user/$repo/blob/$startingCommit/$path
		pathname = `/${getRepoURL()}/new/${getCurrentBranch()}?filename=` + filePath;
	} else {
		menuItem.textContent = 'Committing…';
	}

	// This is either an `edit` or `create` form
	const form = (await fetchDom<HTMLFormElement>(pathname, '.js-blob-form'))!;
	form.elements.value.value = content; // Revert content (`value` is the name of the file content field)
	form.elements.message.value = (form.elements.message as HTMLInputElement).placeholder
		.replace(/^Update/, 'Revert')
		.replace(/^Create/, 'Restore');
	await postForm(form);
}

async function handleRevertFileClick(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const menuItem = event.currentTarget;
	// Allow only one click
	menuItem.removeEventListener('click', handleRevertFileClick as unknown as EventListener);
	menuItem.textContent = 'Reverting…';
	event.preventDefault();
	event.stopPropagation();

	try {
		const file = await getFile(menuItem);

		if (!file) {
			// The file was created by this PR. Revert === Delete.
			// If there was a way to tell if a file was created by the PR, we could skip `getFile`
			// TODO: find this info on the page ("was this file created by this PR?")
			await deleteFile(menuItem);
			return;
		}

		if (file.isTruncated) {
			showError(menuItem, 'Revert failed: File too big');
			return;
		}

		await commitFileContent(menuItem, file.text);

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		showError(menuItem, 'Revert failed. See console for details');
		throw error;
	}
}

function handleMenuOpening(event: DelegateEvent): void {
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
			Revert changes
		</button>
	);
}

function init(): void {
	delegate('#files', '.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Adds button to revert all the changes to a file in a PR.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/62826118-73b7bb00-bbe0-11e9-9449-2dd64c469bb9.gif',
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
