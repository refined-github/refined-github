import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import pushForm from 'push-form';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import fetchDom from '../helpers/fetch-dom';
import {getConversationNumber, getCurrentBranch, getPRHeadRepo} from '../github-helpers';

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
		repository() {
			pullRequest(number: ${getConversationNumber()!}) {
				baseRefOid
			}
		}
	`);
	return repository.pullRequest.baseRefOid;
});

async function getFile(filePath: string): Promise<{isTruncated: boolean; text: string} | undefined> {
	const {repository} = await api.v4(`
		repository() {
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

async function commitFileContent(menuItem: Element, content: string, filePath: string): Promise<void> {
	let {pathname} = menuItem.previousElementSibling as HTMLAnchorElement;
	// Check if file was deleted by PR
	if (menuItem.closest('[data-file-deleted="true"]')) {
		menuItem.textContent = 'Undeleting…';
		pathname = `/${getPRHeadRepo()!.nameWithOwner}/new/${getCurrentBranch()!}?filename=${filePath}`;
	} else {
		menuItem.textContent = 'Committing…';
	}

	// This is either an `edit` or `create` form
	const form = (await fetchDom<HTMLFormElement>(pathname, '.js-blob-form'))!;
	form.elements.value.value = content; // Restore content (`value` is the name of the file content field)
	form.elements.message.value = (form.elements.message as HTMLInputElement).placeholder
		.replace(/^Create|^Update/, 'Restore');

	const response = await pushForm(form);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
}

const filesRestored = new WeakSet<HTMLButtonElement>();
async function handleRestoreFileClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	// Only allow one click
	if (filesRestored.has(menuItem)) {
		return;
	}

	filesRestored.add(menuItem);

	menuItem.textContent = 'Restoring…';
	event.preventDefault();
	event.stopPropagation();

	try {
		const filePath = menuItem.closest<HTMLDivElement>('[data-path]')!.dataset.path!;
		const file = await getFile(filePath);

		if (!file) {
			// The file was created by this PR.
			// This code won’t be reached if `highlight-deleted-and-added-files-in-diffs` works.
			showError(menuItem, 'Nothing to restore. Delete file instead');
			return;
		}

		if (file.isTruncated) {
			showError(menuItem, 'Restore failed: File too big');
			return;
		}

		await commitFileContent(menuItem, file.text, filePath);

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error: unknown) {
		showError(menuItem, 'Restore failed. See console for details');
		features.error(__filebasename, error);
	}
}

function handleMenuOpening({delegateTarget: dropdown}: delegate.Event): void {
	const editFile = select('a[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('.rgh-restore-file', dropdown)) {
		return;
	}

	if (editFile.closest('.file-header')!.querySelector('[aria-label="File added"]')) {
		// The file is new. "Restoring" it means deleting it, which is already possible.
		// Depends on `highlight-deleted-and-added-files-in-diffs`.
		return;
	}

	editFile.after(
		<button
			className="pl-5 dropdown-item btn-link rgh-restore-file"
			style={{whiteSpace: 'pre-wrap'}}
			role="menuitem"
			type="button"
		>
			Restore file
		</button>
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.file-header .js-file-header-dropdown', 'toggle', handleMenuOpening, true);
	delegate(document, '.rgh-restore-file', 'click', handleRestoreFileClick, true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	init
});
