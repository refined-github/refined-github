import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {stringToBase64} from 'uint8array-extras';
import UndoIcon from 'octicons-plain-react/Undo';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import getPrInfo from '../github-helpers/get-pr-info.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';

// Track the currently focused file container for removal after discard
let focusedFileContainer: HTMLElement | undefined;

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

function getFilenames(menuItem: HTMLElement): {original: string; new: string} {
	// Legacy view: get filenames from the data-path and Link--primary elements
	if (menuItem.tagName === 'BUTTON') {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent
			.split(' → ');

		return {original: originalFileName, new: newFileName};
	}

	// New React view: get filenames from the file header
	const fileNameElement = $('[class^="DiffFileHeader-module__file-name"]', focusedFileContainer);
	const span = $optional('span:not(.sr-only)', fileNameElement);
	const [originalFileName, newFileName = originalFileName] = (span ?? fileNameElement)
		// eslint-disable-next-line unicorn/prefer-string-replace-all -- Invisible char
		.textContent.split('  ').map(text => text.replaceAll(/\u200E/g, ''));

	return {original: originalFileName, new: newFileName};
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
	const menuItem = event.delegateTarget;
	const filenames = getFilenames(menuItem);

	const commitTitle = prompt(
		'Are you sure you want to discard these changes? Enter the commit title',
		`Discard changes to ${filenames.original}`,
	);

	if (!commitTitle) {
		return;
	}

	await showToast(async progress => discardChanges(progress, filenames.original, filenames.new, commitTitle), {
		message: 'Loading info…',
		doneMessage: 'Changes discarded',
	});

	// Hide file from view
	if (menuItem.tagName === 'BUTTON') {
		menuItem.closest('.file')!.remove();
		return;
	}

	// New React view: remove the tracked file container and close the menu
	focusedFileContainer!.remove();
	menuItem.closest('div[data-focus-trap="active"]')!.remove();
}

// Legacy view handler
function addLegacyMenuItem(editFile: HTMLAnchorElement): void {
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

// New React view handler: track the file container and add menu item
function handleMenuOpening({delegateTarget}: DelegateEvent<MouseEvent, HTMLElement>): void {
	// Track the file container for later removal
	focusedFileContainer = delegateTarget.closest('[class*="DiffFileHeader-module__diff-file-header"]')!
		.parentElement!;

	// Wait for the menu to be rendered
	requestAnimationFrame(() => {
		const editFile = $('[class^="prc-ActionList-ActionListItem"]:has(.octicon-pencil)');
		const discardItem = editFile.cloneNode(true);
		discardItem.classList.add('rgh-restore-file');
		$('a', discardItem).removeAttribute('href');
		$('[class^="prc-ActionList-ItemLabel"]', discardItem).textContent = 'Discard changes';
		$('[class^="prc-ActionList-LeadingVisual"]', discardItem).replaceChildren(<UndoIcon />);

		editFile.after(discardItem);
	});
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	// Legacy view
	observe('.js-file-header-dropdown a[aria-label^="Change this"]', addLegacyMenuItem, {signal});

	// New React view
	delegate(
		'[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)',
		'click',
		handleMenuOpening,
		{signal},
	);

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
