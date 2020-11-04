import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const leftDiffLines = '.diff-table tr:not(.js-expandable-line) td:nth-child(2)';
const rightDiffLines = '.diff-table tr:not(.js-expandable-line) td:nth-child(4)';

function disableDiffSelection(diffLines: string): void {
	for (const diffLine of select.all(diffLines)) {
		diffLine.style.userSelect = 'none';
	}
}

function init(): void {
	delegate(document.body, leftDiffLines, 'mousedown', () => disableDiffSelection(rightDiffLines));
	delegate(document.body, rightDiffLines, 'mousedown', () => disableDiffSelection(leftDiffLines));

	document.body.addEventListener('mouseup', () => {
		for (const diffLine of select.all('.diff-table tr:not(.js-expandable-line) td:nth-child(even)')) {
			diffLine.style.userSelect = 'auto';
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasCode
	],
	init
});
