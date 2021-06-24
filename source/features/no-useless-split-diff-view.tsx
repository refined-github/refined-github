import './no-useless-split-diff-view.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onDiffFileLoad from '../github-events/on-diff-file-load';

function isUnifiedDiff(): boolean {
	return select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]' // Link in single commit
	]);
}

function handleHunk(hunkEmpty: [boolean, boolean], hunk: HTMLTableRowElement[]): void {
	if (hunk.length > 5) {
		for (const side of [0, 1]) {
			if (hunkEmpty[side]) {
				for (const tr of hunk) {
					// eslint-disable-next-line unicorn/prefer-dom-node-dataset -- CSS file has the same selector, this can be grepped
					tr.setAttribute('data-rgh-no-useless-split-diff-view-hide-hunk', '');
					select(`[data-split-side=${side ? 'left' : 'right'}]`, tr)?.setAttribute('colspan', '3');
				}

				break;
			}
		}
	}
}

function init(): void {
	for (const diffTable of select.all('.js-diff-table:not(.rgh-no-useless-split-diff-view-visited)')) {
		diffTable.classList.add('rgh-no-useless-split-diff-view-visited');
		let wholeFileHidden = false;
		for (const side of ['left', 'right']) {
			if (!select.exists(`[data-split-side="${side}"]:is(.blob-code-addition, .blob-code-deletion)`, diffTable)) {
				// eslint-disable-next-line unicorn/prefer-dom-node-dataset -- CSS file has the same selector, this can be grepped
				diffTable.setAttribute('data-rgh-hide-empty-split-diff-side', side);
				wholeFileHidden = true;
				break;
			}
		}

		if (wholeFileHidden) {
			continue;
		}

		// Hide long hunks on one side

		let currentHunkEmpty: [boolean, boolean] = [true, true];
		let currentHunk: HTMLTableRowElement[] = [];

		for (const tr of select.all('tr[data-hunk]', diffTable)) {
			const tds = select.all('td', tr);
			if (tds.length !== 4) {
				continue;
			}

			if (tds[1].classList.contains('blob-code-context')) {
				// Not in a hunk
				handleHunk(currentHunkEmpty, currentHunk);
				currentHunkEmpty = [true, true];
				currentHunk = [];
				continue;
			}

			for (const side of [0, 1]) {
				if (!tds[(side * 2) + 1].classList.contains('blob-code-empty')) {
					currentHunkEmpty[side] = false;
				}
			}

			if (!currentHunkEmpty[0] && !currentHunkEmpty[1]) {
				// Current hunk contains both sides
				currentHunk = [];
				continue;
			}

			currentHunk.push(tr);
		}

		handleHunk(currentHunkEmpty, currentHunk);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCommit,
		pageDetect.isCompare,
		pageDetect.isPRFiles
	],
	exclude: [
		isUnifiedDiff
	],
	additionalListeners: [
		onDiffFileLoad
	],
	init
});
