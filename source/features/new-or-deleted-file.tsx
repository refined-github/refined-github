import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function add(fileHeader: HTMLDivElement): void {
	const list = $optional('ul[aria-label="File Tree"]');
	if (!list && pageDetect.isCommit()) {
		// Silence error, single-file commits don't have the file list
		return;
	}

	// Link--primary excludes CODEOWNERS icon #5565
	const fileLink = $('a.Link--primary', fileHeader);

	const fileInList = $optional([
		`[href="${fileLink.hash}"]`, // TODO: Old PR Files view, drop in 2026
		`[class^="PRIVATE_TreeView-item-content"]:has([href="${fileLink.hash}"])`,
	], list);
	if (!fileInList) {
		features.unload(import.meta.url);
		throw new Error('Could not find file in sidebar, is the sidebar loaded?');
	}

	const icon = $optional([
		'.octicon-diff-removed', // TODO: Old PR Files view, drop in 2026
		'.octicon-diff-added', // TODO: Old PR Files view, drop in 2026
		'.octicon-file-removed',
		'.octicon-file-added',
		'.octicon-file-moved',
	], fileInList)
		?.cloneNode(true);
	if (icon) {
		// `span` needed for native vertical alignment
		fileHeader.append(<span className="ml-1">{icon}</span>);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe([
		'div.file-info', // TODO: Old PR Files view, drop in 2026
		'div[class*="DiffFileHeader-module__file-path-section"]',
	], add, {signal});
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
