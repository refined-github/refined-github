import './better-diff-selection.css';

import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

let selectedDiffTableBody: HTMLElement | undefined;

function disableDiffSelection(event: Event): void {
	const target = event.target as HTMLElement;
	selectedDiffTableBody = target.closest('tbody')!;
	selectedDiffTableBody.dataset.rghSelect = target.closest('td') === target.closest('tr')!.children[1] ? 'left' : 'right';
}

function restoreDiffSelection(): void {
	if (selectedDiffTableBody) {
		selectedDiffTableBody.removeAttribute('data-rgh-select');
		selectedDiffTableBody = undefined;
	}
}

function init(): void {
	delegate(document.body, '.diff-table tr:not(.js-expandable-line) td:nth-child(even)', 'mousedown', disableDiffSelection);
	document.body.addEventListener('mouseup', restoreDiffSelection);
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasCode
	],
	exclude: [
		() => !select.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
