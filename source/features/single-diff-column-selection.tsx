import './single-diff-column-selection.css';
import delegate from 'delegate-it';

import features from '.';

function getSide(element: Element): 'right' | 'left' {
	return element.closest('td:last-child') ? 'right' : 'left';
}

function pickSelectionSide(event: delegate.Event): void {
	const table = event.delegateTarget.closest('table')!;
	table.dataset.rghSelect = getSide(event.delegateTarget);

	// Selection events are disabled on `user-select:none`, so `mousedown` is what can unset it before they can happen (in the same "mouse click + drag" event)
	document.addEventListener('mousedown', unpickSelectionSide);
}

function unpickSelectionSide(event: Event): void {
	// Note: The table definitely exists or else this listener wouldn't be called, however the clicked element might be anywhere on the page
	const table = $('[data-rgh-select]')!;
	const clickedElement = event.target as Element;

	// No changes are required if the user is clicking the same side
	if (table.contains(clickedElement) && getSide(clickedElement) === table.dataset.rghSelect) {
		return;
	}

	document.removeEventListener('mousedown', unpickSelectionSide);
	delete table.dataset.rghSelect;

	// At this point, without `user-select: none`, Chrome will immediately consider both sides selected, so it will flash the other side’s selection *and* start dragging that text, if the mouse is trying to select it: https://user-images.githubusercontent.com/46634000/98528355-79390080-227c-11eb-9083-d046a7a61f13.gif
	// This line resets the selection to avoid this behavior
	getSelection()!.removeAllRanges();
}

function init(): void {
	delegate(document, '.blob-code', 'selectstart', pickSelectionSide);
}

void features.add(__filebasename, {
	include: [
		() => $.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
