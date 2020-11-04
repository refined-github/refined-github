import './better-diff-selection.css';

import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

function disableDiffSelection(event: Event): void {
	const target = event.target as HTMLElement;
	target.closest('tbody')!.dataset.rghSelect = target.closest('td:last-child') ? 'right' : 'left';
}

function restoreDiffSelection(): void {
	if (document.getSelection()!.isCollapsed) {
		select('[data-rgh-select]')?.removeAttribute('data-rgh-select');
	}
}

function init(): void {
	delegate(document.body, '.diff-table tr:not(.js-expandable-line) td:nth-child(even)', 'mousedown', disableDiffSelection);
	document.body.addEventListener('selectionchange', restoreDiffSelection);
}

void features.add(__filebasename, {
	include: [
		() => select.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
