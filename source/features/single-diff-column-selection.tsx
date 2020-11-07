import './single-diff-column-selection.css';

import select from 'select-dom';
import delegate from 'delegate-it';

import features from '.';

function disableDiffSelection(event: delegate.Event<MouseEvent, HTMLElement>): void {
	if (event.button === 0) {
		document.getSelection()!.empty();
		select('[data-rgh-select]')?.removeAttribute('data-rgh-select');
		event.delegateTarget.closest('tbody')!.dataset.rghSelect = event.delegateTarget.closest('td:last-child') ? 'right' : 'left';
	}
}

function init(): void {
	delegate(document.body, '.blob-code', 'mousedown', disableDiffSelection);
}

void features.add(__filebasename, {
	include: [
		() => select.exists('meta[name="diff-view"][content="split"]')
	],
	init
});
