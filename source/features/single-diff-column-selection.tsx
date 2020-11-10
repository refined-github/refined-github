import './single-diff-column-selection.css';

import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

function getSide(element: Element): 'right' | 'left' {
	return element.closest('td:last-child') ? 'right' : 'left';
}

function pickSelectionSide(event: delegate.Event): void {
	const table = event.delegateTarget.closest('tbody')!;
	table.dataset.rghSelect = getSide(event.delegateTarget);
	table.addEventListener('mousedown', unpickSelectionSide);
}

function unpickSelectionSide(event: Event): void {
	const table = event.currentTarget as HTMLElement;
	if (getSide(event.target as Element) !== table.dataset.rghSelect) {
		getSelection()!.removeAllRanges();
		delete table.dataset.rghSelect;
		table.removeEventListener('mousedown', unpickSelectionSide);
	}
}

function init(): void {
	delegate(document.body, '.blob-code', 'selectstart', pickSelectionSide);
}

void features.add(__filebasename, {
	include: [
		() => select.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
