import React from 'dom-chef';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {stringToBase64} from 'uint8array-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

async function getMergeBaseReference(): Promise<string> {
	const {base, head} = getBranches();
	// This v3 response is relatively large, but it doesn't seem to be available on v4
	// Cache buster due to: https://github.com/refined-github/refined-github/issues/7312
	const response = await api.v3(`compare/${base.relative}...${head.relative}?cachebust=${Date.now()}`);
	return response.merge_base_commit.sha; // #4679
}

async function getHeadReference(): Promise<string> {
	const {base} = getBranches();
	const {headRefOid} = await getPrInfo(base.relative);
	return headRefOid;
}

async function getFile(filePath: string): Promise<string | undefined> {
	const ref = await getMergeBaseReference();
	const {textContent} = await api.v3(
		`contents/${filePath}?ref=${ref}`,
		{
			json: false,
			headers: {
				Accept: 'application/vnd.github.raw',
			},
		},
	);
	return textContent;
}

async function discardChanges(progress: (message: string) => void, originalFileName: string, newFileName: string, headline: string): Promise<void> {
	const [headReference, file] = await Promise.all([
		getHeadReference(),
		getFile(originalFileName),
	]);

	const isNewFile = !file;
	const isRenamed = originalFileName !== newFileName;

	const contents = file ? stringToBase64(file) : '';
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
					headline,
				},
			},
		},
	});
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;

	const [originalFileName, newFileName = originalFileName] = menuItem
		.closest('[data-path]')!
		.querySelector('.Link--primary')!
		.textContent
		.split(' → ');

	const commitTitle = prompt(`Are you sure you want to discard the changes to ${newFileName}? Enter the commit title`, `Discard changes to ${newFileName}`);
	if (!commitTitle) {
		return;
	}

	await showToast(async progress => discardChanges(progress, originalFileName, newFileName, commitTitle), {
		message: 'Loading info…',
		doneMessage: 'Changes discarded',
	});

	// Hide file from view
	menuItem.closest('.file')!.remove();
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

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

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
