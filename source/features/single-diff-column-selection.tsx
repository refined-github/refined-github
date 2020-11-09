import './single-diff-column-selection.css';

import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

function getSide(element: Element): 'right' | 'left' {
	return element.closest('td:last-child') ? 'right' : 'left';
}

function pickSelectionSide(event: delegate.Event<MouseEvent, HTMLElement>): void {
}

function unpickSelectionSide(event: delegate.Event<MouseEvent, HTMLElement>): void {
	const currentSide = event.delegateTarget.closest('tbody')!.dataset.rghSelect;
	if (getSide(event.delegateTarget) !== currentSide) {
		getSelection()!.removeAllRanges();
		select('[data-rgh-select]')?.removeAttribute('data-rgh-select');
	}
}

function resetClassesWhenEmpty(): void {
	const selection = getSelection()!;

	if (selection.isCollapsed) {
		select('[data-rgh-select]')?.removeAttribute('data-rgh-select');
		return;
	}

	const range = selection.getRangeAt(0);

	if (!['TR', 'TBODY'].includes((range.commonAncestorContainer as Element).tagName)) {
		// Ignore

	} else if (range.startContainer.parentElement!.closest('.blob-code')) {
		range.startContainer.parentElement!.closest('tbody')!.dataset.rghSelect = getSide(range.startContainer.parentElement!);
	}
}

function init(): void {
	delegate(document.body, '.blob-code', 'selectstart', pickSelectionSide);
	delegate(document.body, '[data-rgh-select] .blob-code', 'mousedown', unpickSelectionSide);
	document.addEventListener('selectionchange', resetClassesWhenEmpty);
}

void features.add(__filebasename, {
	include: [
		() => select.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
