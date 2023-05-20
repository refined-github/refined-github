import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';

async function getMergeBaseReference(): Promise<string> {
	const {base, head} = getBranches();
	// This v3 response is relatively large, but it doesn't seem to be available on v4
	const response = await api.v3(`compare/${base.relative}...${head.relative}`);
	return response.merge_base_commit.sha; // #4679
}

async function getHeadReference(): Promise<string> {
	const {base} = getBranches();
	const {headRefOid} = await getPrInfo(base.relative);
	return headRefOid;
}

async function getFile(filePath: string): Promise<{isTruncated: boolean; text: string} | undefined> {
	const {repository} = await api.v4(`
		query getFile($owner: String!, $name: String!, $file: String!) {
			repository(owner: $owner, name: $name) {
				file: object(expression: $file) {
					... on Blob {
						isTruncated
						text
					}
				}
			}
		}
	`, {
		variables: {
			file: `${await getBaseReference()}:${filePath}`,
		},
	});
	return repository.file;
}

async function discardChanges(progress: (message: string) => void, filePath: string): Promise<void> {
	const file = await getFile(filePath);

	if (file?.isTruncated) {
		throw new Error('File too big, you’ll have to use git');
	}

	// Only possible if `highlight-deleted-and-added-files-in-diffs` is broken or disabled
	const isNewFile = !file;

	const {nameWithOwner, branch: prBranch} = getBranches().head;
	progress('Committing…');

	await api.v4(`
		mutation discardChanges ($input: CreateCommitOnBranchInput!) {
			createCommitOnBranch(input: $input) {
				commit {
					oid
				}
			}
		}
	`, {
		variables: {
			input: {
				branch: {
					repositoryNameWithOwner: nameWithOwner,
					branchName: prBranch,
				},
				expectedHeadOid: await getHeadReference(),
				fileChanges: (
					isNewFile
						? {deletions: [
							{
								path: filePath,
							},
						]}
						: {additions: [
							{
								path: filePath,
								contents: btoa(unescape(encodeURIComponent(file.text))),
							},
						]}
				),
				message: {
					headline: `Discard changes to ${filePath}`,
				},
			},
		},
	});
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	try {
		const filePath = menuItem.closest<HTMLDivElement>('[data-path]')!.dataset.path!;
		await showToast(async progress => discardChanges(progress!, filePath), {
			message: 'Loading info…',
			doneMessage: 'Changes discarded',
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
		// The file is new. "Discarding changes" means deleting it, which is already possible.
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
			Discard changes
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

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/16/files

*/
