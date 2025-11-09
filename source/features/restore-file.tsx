import React from 'dom-chef';
import GitCompareIcon from 'octicons-plain-react/GitCompare';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {stringToBase64} from 'uint8array-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getBranches, getFilenames} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';
import { $ } from 'select-dom';

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
	const filenames = getFilenames(menuItem)

	const commitTitle = prompt('Are you sure you want to discard these changes? Enter the commit title', `Discard changes to ${filenames.original}`);

	if (!commitTitle) {
		return;
	}

	await showToast(async progress => discardChanges(progress!, filenames.original, filenames.new, commitTitle), {
		message: 'Loading info…',
		doneMessage: 'Changes discarded',
	});

	// Hide file from view
	const filesWrapper = $('div[class^="prc-PageLayout-Content-"] div[data-hpc="true"]')
	if (filesWrapper) {
		const fileElement = Array.from(filesWrapper.children).find(child =>
			child.textContent?.includes(filenames.original)
		) as HTMLElement | null;

		if (fileElement) {
			fileElement.remove();
		}
	} else {
		menuItem.closest('.file')!.remove();
	}
}

function add(editFile: HTMLAnchorElement): void {
	const content = editFile.tagName === 'LI'
		? (
			// Render new row for React view
				<li
					className={editFile.className}
					role="none"
				>
					<a className={`rgh-restore-file ${editFile.querySelector('a')!.className}`}>
						<GitCompareIcon className="color-fg-muted" />
						<span style={{gridArea: 'content'}}>Discard changes</span>
					</a>
				</li>
			)
		: (
			// Render old row for original view
				<button
					className="pl-5 dropdown-item btn-link rgh-restore-file"
					role="menuitem"
					type="button"
				>
					Discard changes
				</button>
			);

	editFile.after(content);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	// Support both old and new PR Files dropdown markup:
	// - Old: `.js-file-header-dropdown a[aria-label^="Change this"]`
	// - New (React): The new dropdown is a `ul` menu whose li's have anchors with specific keyboard shortcuts exposed as aria values
	observe([
		'.js-file-header-dropdown a[aria-label^="Change this"]',
		'ul[role="menu"] li:has(a[aria-keyshortcuts="e"])',
	], add, {signal});

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
