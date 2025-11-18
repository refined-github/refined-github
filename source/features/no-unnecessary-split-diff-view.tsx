import './no-unnecessary-split-diff-view.css';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

/* TODO: remove in late 2026 */
void features.addCssFeature(import.meta.url);

function manageSplitDiffState(tableBody: HTMLTableSectionElement): void {
	const table = tableBody.closest('table')!;
	const columnsGroup = $('colgroup', table);
	// Diff view is unified
	if (columnsGroup.childElementCount !== 4) {
		table.classList.remove('rgh-no-split-diff');
		return;
	}

	// Avoid selecting suggested deletions/additions
	if (!$optional(':scope > tr > td:nth-child(2) > .deletion', tableBody)) {
		table.classList.add('rgh-no-split-diff', 'rgh-only-additions');
	} else if (!$optional(':scope > tr > td:nth-child(4) > .addition', tableBody)) {
		table.classList.add('rgh-no-split-diff', 'rgh-only-deletions');
	}
}

function init(signal: AbortSignal): void {
	observe('[class*="DiffLines-module__tableLayoutFixed"] > tbody', manageSplitDiffState, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
		pageDetect.isCompare,
		pageDetect.isCommit,
	],
	init,
});

/*

## Test URLs

### PR files

https://github.com/refined-github/sandbox/pull/50/files?diff=split

### PR files with annotations

https://github.com/fregante/sandbox/pull/30/files

### Compare page

https://github.com/refined-github/sandbox/compare/no-unnecessary-split-diff-view?expand=1&diff=split

### Single commit

https://github.com/refined-github/sandbox/commit/c28cc8e5271452b5b4c347d46a63f717c29417d6?diff=split

*/
