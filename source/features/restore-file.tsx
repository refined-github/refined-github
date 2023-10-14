import React from 'dom-chef';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import observe from '../helpers/selector-observer.js';
import GetFile from './restore-file.gql';

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
	const {repository} = await api.v4(GetFile, {
		variables: {
			file: `${await getMergeBaseReference()}:${filePath}`,
		},
	});
	return repository.file;
}

async function discardChanges(progress: (message: string) => void, originalFileName: string, newFileName: string): Promise<void> {
	const [headReference, file] = await Promise.all([
		getHeadReference(),
		getFile(originalFileName),
	]);

	if (file?.isTruncated) {
		throw new Error('File too big, you’ll have to use git');
	}

	const isNewFile = !file;
	const isRenamed = originalFileName !== newFileName;

	const contents = file ? btoa(unescape(encodeURIComponent(file.text))) : '';
	const deleteNewFile = {deletions: [{path: newFileName}]};
	const restoreOldFile = {additions: [{path: originalFileName, contents}]};
	const fileChanges = isRenamed
		? {...restoreOldFile, ...deleteNewFile} // Renamed, maybe also changed
		: isNewFile
			? deleteNewFile // New
			: restoreOldFile; // Changes

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
				expectedHeadOid: headReference,
				fileChanges,
				message: {
					headline: `Discard changes to ${originalFileName}`,
				},
			},
		},
	});
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	try {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent
			.split(' → ');
		await showToast(async progress => discardChanges(progress!, originalFileName, newFileName), {
			message: 'Loading info…',
			doneMessage: 'Changes discarded',
		});

		// Hide file from view
		menuItem.closest('.file')!.remove();
	} catch (error) {
		features.log.error(import.meta.url, error);
	}
}

function add(editFile: HTMLAnchorElement): void {
	editFile.after(
		<button
			className="pl-5 dropdown-item btn-link rgh-restore-file"
			role="menuitem"
			type="button"
		>
			Discard changes
		</button>,
	);
}

function init(signal: AbortSignal): void {
	observe('.js-file-header-dropdown a[aria-label^="Change this"]', add, {signal});

	// `capture: true` required to be fired before GitHub's handlers
	delegate('.rgh-restore-file', 'click', handleClick, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/16/files
https://github.com/refined-github/sandbox/pull/29/files

*/
