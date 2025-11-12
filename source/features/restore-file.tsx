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
import {expectToken} from '../github-helpers/github-token.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import {getLegacyMenuItem, getMenuItem} from './more-file-links.js';

function getFilenames(menuItem: HTMLElement): {original: string; new: string} {
	// TODO: Drop support for old view in June 2026
	if (menuItem.tagName === 'A') {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent!
			.split(' → ');

		return {original: originalFileName, new: newFileName};
	}

	const fileAnchor: HTMLAnchorElement = menuItem
		.closest('ul')!
		.querySelector('li:has(svg.octicon-eye) a')!;

	const fileUrl = fileAnchor.href;

	const {head} = getBranches();

	const reactPropsRaw = $('[data-target="react-app.embeddedData"]').textContent;
	const reactProps = JSON.parse(reactPropsRaw!);

	let originalFileName = '';
	// Get the new filename from the "View File" button href
	const urlRegex = new RegExp(
		`https:\/\/github.com\/${head?.nameWithOwner.replaceAll('/', '\/')}\/blob\/[^/]+\/`,
	);
	const newFileName = fileUrl.replace(urlRegex, '')!;

	// Leverage the React props inlined in a script tag in order to determine whether or not we're
	// dealing with a RENAME change, in which case we'll also need to find the old filename correctly
	const diffContents = reactProps.payload.diffContents.find((dc: Record<string, unknown>) =>
		dc.path === newFileName,
	);
	if (diffContents.status === 'RENAMED') {
		originalFileName = diffContents.oldTreeEntry.path;
	} else {
		originalFileName = newFileName;
	}

	return {original: originalFileName, new: newFileName};
}

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
	event.preventDefault();

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
	// TODO: Drop support for old view in June 2026
	if (menuItem.tagName === 'A') {
		menuItem.closest('.file')!.remove();
		return;
	}

	const filesWrapper = $('div[class^="prc-PageLayout-Content-"] div[data-hpc="true"]');
	const fileElement = [...filesWrapper.children].find(child => {
		if (child.textContent === '') {
			return false;
		}

		const filenameRegex = child.textContent!.match(/^Collapse file([\s\S]*?)Copy file name(?: to clipboard)?/);
		let originalFilename = filenameRegex![1].trim();

		// Rename changes return not just the file name, but "X renamed to Y" so require a bit more clean up.
		if (originalFilename && /\brenamed\s+to\b/i.test(originalFilename)) {
			originalFilename = originalFilename.split(/\s+renamed\s+to\s+/i)[0].trim();
		}

		// Clean any non-visible whitespace characters
		originalFilename = originalFilename.replaceAll(/[\u200E\u200F\uFEFF]/g, '');

		return originalFilename === filenames.original;
	}) as HTMLElement | undefined;

	// Remove file element in list as well as portaled dropdown menu
	fileElement!.remove();
	menuItem.closest('div[data-focus-trap="active"]')!.remove();
}

function handleLegacyMenuOpening({delegateTarget: dropdown}: DelegateEvent): void {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const editFile = $('a[data-ga-click^="Edit file"]', dropdown);

	const discardChangesButton = getLegacyMenuItem(editFile, 'Discard Changes', 'Discard Changes');
	discardChangesButton.classList.add('rgh-restore-file');

	editFile.after(discardChangesButton);
}

function handleMenuOpening(): void {
	const editFile = $('[class^="prc-ActionList-ActionListItem"]:has(.octicon-pencil)');

	const discardChangesButton = getMenuItem(editFile, 'Discard Changes', '', <GitCompareIcon />);
	discardChangesButton.classList.add('rgh-restore-file');

	editFile.after(discardChangesButton);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	// `capture: true` required to be fired before GitHub's handlers
	delegate('.rgh-restore-file', 'click', handleClick, {capture: true, signal});

	delegate(
		'.file-header .js-file-header-dropdown',
		'toggle',
		handleLegacyMenuOpening,
		{capture: true, signal},
	);
	delegate(
		'[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)',
		'click',
		handleMenuOpening,
	);
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
