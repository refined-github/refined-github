import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// Use specific classes to avoid selecting unrelated icons.
// Include `svg` to exclude extensions like "Material Icons for GitHub".
// Include the unused "diff" icon to keep the list exhaustive and avoid $optional.
const iconSelectors = [
	'svg.octicon-file-removed',
	'svg.octicon-file-added',
	'svg.octicon-file-moved',
	'svg.octicon-file-diff',
] as const;

function maybeAddIconLegacy(filename: HTMLAnchorElement): void {
	const list = $optional('ul[aria-label="File Tree"]');
	if (!list && pageDetect.isCommit()) {
		// Silence error, single-file commits don't have the file list
		return;
	}

	const fileInList = $optional(`[href="${filename.hash}"]`, list);
	if (!fileInList) {
		features.unload(import.meta.url);
		throw new Error('Could not find file in sidebar, is the sidebar loaded?');
	}

	const icon = $optional(['.octicon-diff-removed', '.octicon-diff-added'], fileInList);
	if (icon) {
		// `span` needed for native vertical alignment
		filename.parentElement!.append(
			<span className="ml-1">{icon.cloneNode(true)}</span>,
		);
	}
}

function maybeAddIcon(fileHeader: HTMLDivElement): void {
	const list = $('ul[aria-label="File Tree"]');
	const fileLink = $('a', fileHeader);
	const fileInList = $(`li[class*="file-tree-row"]:has([href="${fileLink.hash}"])`, list);
	const listIcon = $(iconSelectors, fileInList);
	if (listIcon.classList.contains('octicon-file-diff')) {
		// We only select the icon to avoid $optional
		return;
	}

	const icon = listIcon.cloneNode(true);
	// Undo `display: none` that might be added by extensions like "Material Icons for GitHub"
	icon.style.display = 'block';
	fileHeader.append(<div className="d-flex ml-1">{icon}</div>);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('div[class*="file-path-section"]', maybeAddIcon, {signal});
	// TODO: Old PR Files view, drop in 2027
	// Link--primary excludes CODEOWNERS icon #5565
	observe('.file-info a.Link--primary', maybeAddIconLegacy, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
	],
	init,
});

/*

## Test URLs

Commit: https://github.com/refined-github/sandbox/commit/a00694ff7370d46b5f6d723a0b39141903dae45a
PR: https://github.com/refined-github/sandbox/pull/71/files
PR with CODEOWNERS: https://github.com/dotnet/winforms/pull/6028/files
1-file commits: https://github.com/refined-github/sandbox/commit/1ed862e3abd13004009927b26355a51a109d6855

*/
