import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {getBranches} from '../github-helpers/pr-branches.js';
import observe from '../helpers/selector-observer.js';
import {frame} from '../helpers/dom-utils.js';

/** Rebuilds the "View file" link to point to the head repo and its branch instead of the base repo and the commit */
function rebuildFileLink(viewFileLink: HTMLAnchorElement, filePath: string): void {
	const {owner, name, branch} = getBranches().head;

	// Do not replace with `GitHubFileURL` #3152 #3111 #2595
	viewFileLink.pathname = [owner, name, 'blob', branch, ...filePath.split('/')]
		.map(part => encodeURIComponent(part)) // Path can contain special chars: #8473
		.join('/');
}

function isDeletedFile(fileHeader: HTMLElement): boolean {
	const diffLink = $('a', fileHeader);
	const diffInFileTree = $(
		`ul[aria-label="File Tree"] li[class*="file-tree-row"]:has([href="${diffLink.hash}"])`
	);
	return elementExists('.octicon-file-removed', diffInFileTree);
}

function getFilePath(fileHeader: HTMLElement): string {
	const fileNameElement = $('[class*="file-name"] code', fileHeader);
	const renamedTooltip = $optional('span.sr-only', fileNameElement);
	return (
		// Tooltip doesn't exist if the file wasn't renamed
		renamedTooltip?.textContent.split(' renamed to ')[1]
		?? fileNameElement.textContent
	).replaceAll(/\u200E|\u200F/g, '').trim();
}

async function handleMenuOpening({delegateTarget: menuButton}: DelegateEvent): Promise<void> {
	// Don't run if the menu has been closed
	// Check inverted value because `capture: true` makes this run before handler that toggle state
	if (menuButton.ariaExpanded === 'true') {
		return;
	}

	const fileHeader = menuButton.closest('[class*="diff-file-header"]')!;
	if (isDeletedFile(fileHeader)) {
		return;
	}

	const filePath = getFilePath(fileHeader);

	// Wait for the menu DOM to be created, but not rendered
	await frame();

	const viewFile = $('a[class^="prc-ActionList-ActionListContent"]:has(.octicon-eye)');
	rebuildFileLink(viewFile, filePath);
}

// Legacy PR files view -- TODO: Drop after it is removed
function alter(viewFileLink: HTMLAnchorElement): void {
	const filePath = viewFileLink.closest('[data-path]')!.getAttribute('data-path')!;
	rebuildFileLink(viewFileLink, filePath);
}

function init(signal: AbortSignal): void {
	delegate(
		'div[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)',
		'click',
		handleMenuOpening,
		// `capture: true` to run before `more-file-links`
		{capture: true, signal},
	);
	// Legacy PR files view -- TODO: Drop after it is removed
	observe(
		'.file-header:not([data-file-deleted="true"]) a.dropdown-item[data-ga-click^="View file"]',
		alter,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		// Editing files doesn't make sense after a PR is closed/merged
		pageDetect.isClosedConversation,
		// If you're viewing changes from partial commits, ensure you're on the latest one.
		() => pageDetect.isPRCommit() && !elementExists('[aria-label="No next commit"]'),
		// Legacy PR files view -- TODO: Drop after it is removed
		() => elementExists('.js-commits-filtered') && !elementExists('[aria-label="You are viewing the latest commit"]'),
	],
	awaitDomReady: true, // DOM-based filters, feature is invisible and inactive until dropdown is opened
	init,
});

/*

Test URLs

- PR: https://github.com/refined-github/sandbox/pull/4/changes
- deleted head repository: https://github.com/refined-github/refined-github/pull/271/changes
- File with brackets in the path: https://github.com/refined-github/sandbox/pull/114/changes
- Renamed and deleted files: https://github.com/refined-github/sandbox/pull/132/changes
*/
