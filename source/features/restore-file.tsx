import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import * as api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber} from '../github-helpers/index.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';

async function getBaseReference(): Promise<string> {
	const {base} = getBranches();
	const {baseRefOid} = await getPrInfo(base.relative);
	return baseRefOid;
}

async function getHeadReference(): Promise<string> {
	// Get the sha of the latest commit to the PR, required to create a new commit
	const {repository} = await api.v4(`
		repository() { # Cache buster ${Math.random()}
			pullRequest(number: ${getConversationNumber()!}) {
				headRefOid
			}
		}
	`);
	return repository.pullRequest.headRefOid;
}

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

async function removeFile(progress: (message: string) => void, filePath: string): Promise<void> {
	const file = await getFile(filePath);

	if (file?.isTruncated) {
		throw new Error('File too big, you’ll have to use git');
	}

	// Only possible if `highlight-deleted-and-added-files-in-diffs` is broken or disabled
	const isNewFile = !file;

	const change = isNewFile ? `
		deletions: [
			{
				path: "${filePath}"
			}
		]
	` : `
		additions: [
			{
				path: "${filePath}",
				contents: "${btoa(unescape(encodeURIComponent(file.text)))}"
			}
		]
	`;

	const {nameWithOwner, branch: prBranch} = getBranches().head;
	progress('Committing…');

	await api.v4(`mutation {
		createCommitOnBranch(input: {
			branch: {
				repositoryNameWithOwner: "${nameWithOwner}",
				branchName: "${prBranch}"
			},
			expectedHeadOid: "${await getHeadReference()}",
			fileChanges: {
				${change}
			},
			message: {
				headline: "Remove ${filePath} from PR"
			}
		}) {
			commit {
				oid
			}
		}
	}`);
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	try {
		const filePath = menuItem.closest<HTMLDivElement>('[data-path]')!.dataset.path!;
		await showToast(async progress => removeFile(progress!, filePath), {
			message: 'Fetching info…',
			doneMessage: 'File removed from PR',
		});

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		features.log.error(import.meta.url, error);
	}
}

function handleMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
	const editFile = select('a[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('.rgh-restore-file', dropdown)) {
		return;
	}

	if (editFile.closest('.file-header')!.querySelector('[aria-label="File added"]')) {
		// The file is new. "Removing from PR" it means deleting it, which is already possible.
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
			Remove from PR
		</button>,
	);
}

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate('.file-header .js-file-header-dropdown', 'toggle', handleMenuOpening, {capture: true, signal});
	delegate('.rgh-restore-file', 'click', handleClick, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	init,
});
