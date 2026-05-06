import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import FoldIcon from 'octicons-plain-react/Fold';
import UnfoldIcon from 'octicons-plain-react/Unfold';
import {$$, $optional} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const fileSelector = '.js-file' as const;
const chevronSelector = 'button.js-details-target' as const;
const loadDiffSelector = '.js-diff-load' as const;

function expandAll(): void {
	// Snapshot the lists first: clicking `.js-diff-load` removes the link and
	// adds `.Details--on` to its file, which would otherwise re-shuffle what
	// the second selector matches mid-loop.
	const filesToLoad = $$(`${fileSelector}:has(${loadDiffSelector})`);
	const filesToExpand = $$(`${fileSelector}:not(.Details--on):not(:has(${loadDiffSelector}))`);

	for (const file of filesToLoad) {
		$optional(loadDiffSelector, file)?.click();
	}

	for (const file of filesToExpand) {
		$optional<HTMLButtonElement>(chevronSelector, file)?.click();
	}
}

function collapseAll(): void {
	for (const file of $$(`${fileSelector}.Details--on`)) {
		$optional<HTMLButtonElement>(chevronSelector, file)?.click();
	}
}

function addButtons(toolbar: HTMLElement): void {
	toolbar.append(
		<div className="BtnGroup ml-2 rgh-expand-collapse-files-buttons">
			<button
				type="button"
				className="btn btn-sm BtnGroup-item"
				onClick={collapseAll}
			>
				<FoldIcon className="mr-1" />
				Collapse all
			</button>
			<button
				type="button"
				className="btn btn-sm BtnGroup-item"
				onClick={expandAll}
			>
				<UnfoldIcon className="mr-1" />
				Expand all
			</button>
		</div>,
	);
}

function init(signal: AbortSignal): void {
	observe('.pr-toolbar', addButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit,
	],
	init,
});

/*

Test URLs:

- Many files: https://github.com/refined-github/refined-github/pull/9325/files
- Few files: https://github.com/refined-github/sandbox/pull/55/files

*/
