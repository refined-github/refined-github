import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import showToast from '../github-helpers/toast';
import {getConversationNumber} from '../github-helpers';

// Get the current base commit of this PR. It should change after rebases and merges in this PR.
// This value is not consistently available on the page (appears in `/files` but not when only 1 commit is selected)
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
const getHeadReference = async (): Promise<string> => {
	// Get the sha of the latest commit to the PR, required to create a new commit
	const {repository} = await api.v4(`
		repository() { # Cache buster ${Math.random()}
			pullRequest(number: ${getConversationNumber()!}) {
				headRefOid
			}
		}
	`);
	return repository.pullRequest.headRefOid;
};

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

async function restoreFile(progress: (message: string) => void, menuItem: Element, filePath: string): Promise<void> {
	const file = await getFile(filePath);

	if (!file) {
		// The file was created by this PR.
		// This code won’t be reached if `highlight-deleted-and-added-files-in-diffs` works.
		throw new Error('Nothing to restore. Delete file instead');
	}

	if (file.isTruncated) {
		throw new Error('Restore failed: File too big');
	}

	const [nameWithOwner, prBranch] = select('.head-ref')!.title.split(':');
	progress(menuItem.closest('[data-file-deleted="true"]') ? 'Undeleting…' : 'Committing…');

	const content = file.text;
	await api.v4(`mutation {
		createCommitOnBranch(input: {
			branch: {
				repositoryNameWithOwner: "${nameWithOwner}",
				branchName: "${prBranch}"
			},
			expectedHeadOid: "${await getHeadReference()}",
			fileChanges: {
				additions: [
					{
						path: "${filePath}",
						contents: "${btoa(unescape(encodeURIComponent(content)))}"
					}
				]
			},
			message: {
				headline: "Restore ${filePath}"
			}
		}) {
			commit {
				oid
			}
		}
	}`);
}

const filesRestored = new WeakSet<HTMLButtonElement>();
async function handleRestoreFileClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	// Only allow one click
	if (filesRestored.has(menuItem)) {
		return;
	}

	filesRestored.add(menuItem);

	try {
		const filePath = menuItem.closest<HTMLDivElement>('[data-path]')!.dataset.path!;
		// Show toast while restoring
		await showToast(async progress => restoreFile(progress!, menuItem, filePath), {
			message: 'Restoring…',
			doneMessage: 'Restored!',
		});

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error: unknown) {
		features.log.error(import.meta.url, error);
	}
}

function handleMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
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
		</button>,
	);
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.file-header .js-file-header-dropdown', 'toggle', handleMenuOpening, true);
	delegate(document, '.rgh-restore-file', 'click', handleRestoreFileClick, true);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	init,
});
