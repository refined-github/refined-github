import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
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

	let originalFileName = '';
	let newFileName = '';
	// eslint-disable-next-line ts/no-restricted-types -- prompt also returns null
	let commitTitle: undefined | null | string;

	if (menuItem.tagName === 'A') {
		const fileUrl = menuItem
			.parentNode
			?.parentNode
			?.querySelector('li[data-variant="danger"] a')!
			.href;

		const repo = pageDetect.utils.getRepositoryInfo(globalThis.location);
		const {head} = getBranches();

		const reactPropsRaw = $('[data-target="react-app.embeddedData"]').textContent;
		const reactProps = JSON.parse(reactPropsRaw);

		newFileName = fileUrl?.replaceAll(`https://github.com/${repo?.nameWithOwner}/delete/${head.branch}/`, '') ?? '';

		const diffContents = reactProps.payload.diffContents.find((dc: Record<string, unknown>) => dc.path === newFileName);
		if (diffContents.status === 'RENAMED') {
			originalFileName = diffContents.oldTreeEntry.path;
		} else {
			originalFileName = newFileName;
		}

		commitTitle = prompt('Are you sure you want to discard these changes? Enter the commit title', `Discard changes to ${originalFileName}`);
		if (!commitTitle) {
			return;
		}
	} else {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent
			.split(' → ');

		commitTitle = prompt(`Are you sure you want to discard the changes to ${newFileName}? Enter the commit title`, `Discard changes to ${newFileName}`);
		if (!commitTitle) {
			return;
		}
	}

	await showToast(async progress => discardChanges(progress!, originalFileName, newFileName, commitTitle), {
		message: 'Loading info…',
		doneMessage: 'Changes discarded',
	});

	// Hide file from view
	menuItem.closest('.file')!.remove();
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
						<svg aria-hidden="true" focusable="false" className="octicon octicon-file-diff fgColor-muted mr-2" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style={{alignSelf: 'anchor-center'}}><path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073ZM8 3.25a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0V7h-1.5a.75.75 0 0 1 0-1.5h1.5V4A.75.75 0 0 1 8 3.25Zm-3 8a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"></path></svg>
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
