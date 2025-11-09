import React from 'dom-chef';
import GitCompareIcon from 'octicons-plain-react/GitCompare';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {stringToBase64} from 'uint8array-extras';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';
import {getBranches} from '../github-helpers/pr-branches.js';

function getFilenames(menuItem: HTMLElement): {original: string; new: string} {
	if (menuItem.tagName === 'A') {
		const fileUrl = menuItem
			.parentElement!
			.parentElement!
			.querySelector('li[data-variant="danger"] a')!
			.href;

		const {head} = getBranches();

		const reactPropsRaw = $('[data-target="react-app.embeddedData"]').textContent;
		const reactProps = JSON.parse(reactPropsRaw);

		let originalFileName = '';
		// Get the new filename from the "Delete" button href
		const newFileName = fileUrl?.replaceAll(`https://github.com/${head?.nameWithOwner}/delete/${head.branch}/`, '') ?? '';

		// Leverage the React props inlined in a script tag in order to determine whether or not we're dealing with a RENAME
		// type change, in which case we'll also need to find the old filename correctly
		const diffContents = reactProps.payload.diffContents.find((dc: Record<string, unknown>) => dc.path === newFileName);
		if (diffContents.status === 'RENAMED') {
			originalFileName = diffContents.oldTreeEntry.path;
		} else {
			originalFileName = newFileName;
		}

		return {original: originalFileName, new: newFileName};
	} else {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent
			.split(' → ');

		return {original: originalFileName, new: newFileName};
	}
};

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
	const filenames = getFilenames(menuItem);

	const commitTitle = prompt('Are you sure you want to discard these changes? Enter the commit title', `Discard changes to ${filenames.original}`);

	if (!commitTitle) {
		return;
	}

	await showToast(async progress => discardChanges(progress!, filenames.original, filenames.new, commitTitle), {
		message: 'Loading info…',
		doneMessage: 'Changes discarded',
	});

	// Hide file from view
	const filesWrapper = $('div[class^="prc-PageLayout-Content-"] div[data-hpc="true"]');
	if (filesWrapper) {
		const fileElement = [...filesWrapper.children].find(child =>
			child.textContent?.includes(filenames.original),
		) as HTMLElement | undefined;

		fileElement!.remove();
	} else {
		menuItem.closest('.file')!.remove();
	}
}

function add(editFile: HTMLAnchorElement): void {
	// TODO: Drop support for old view in June 2026
	if (editFile.tagName === 'A') {
		editFile.after(
			<button
				className="pl-5 dropdown-item btn-link rgh-restore-file"
				role="menuitem"
				type="button"
			>
				Discard changes
			</button>,
		);

		return;
	}

	editFile.after(
		<li
			className={editFile.className}
			role="none"
		>
			<a className={`rgh-restore-file ${editFile.querySelector('a')!.className}`}>
				<GitCompareIcon className="color-fg-muted" />
				<span style={{gridArea: 'content'}}>Discard changes</span>
			</a>
		</li>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

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
