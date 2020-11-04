import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let disabledDiffTable: HTMLElement | undefined;

const leftDiffLines = '.diff-table tr:not(.js-expandable-line) td:nth-child(2)';
const rightDiffLines = '.diff-table tr:not(.js-expandable-line) td:nth-child(4)';

function getTableBody(element: HTMLElement): HTMLElement {
	let parent = element;
	do {
		parent = parent.parentElement!;
	} while (parent.tagName !== 'TBODY');

	return parent;
}

function disableDiffSelection(diffLines: string, clickedElement: HTMLElement): void {
	disabledDiffTable = getTableBody(clickedElement);

	for (const diffLine of select.all(diffLines, disabledDiffTable)) {
		diffLine.style.userSelect = 'none';
	}
}

function init(): void {
	delegate(document.body, leftDiffLines, 'mousedown', event => disableDiffSelection(rightDiffLines, event.target as HTMLElement));
	delegate(document.body, rightDiffLines, 'mousedown', event => disableDiffSelection(leftDiffLines, event.target as HTMLElement));

	document.body.addEventListener('mouseup', () => {
		if (disabledDiffTable) {
			for (const diffLine of select.all('tr:not(.js-expandable-line) td:nth-child(even)', disabledDiffTable)) {
				diffLine.style.userSelect = 'auto';
			}

			disabledDiffTable = undefined;
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasCode
	],
	init
});
