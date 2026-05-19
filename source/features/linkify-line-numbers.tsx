import * as pageDetect from 'github-url-detection';
import {$closest} from 'select-dom';
import delegate, {type DelegateEvent} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';

import features from '../feature-manager.js';
import onAlteredClick from '../helpers/on-altered-click.js';
import observe from '../helpers/selector-observer.js';

function openLinkToLine(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	const lineNumberCell = event.delegateTarget;
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = $closest(['.Box', '.review-thread-component'], lineNumberCell)
		.querySelector(['a[href*="#L"]', 'a[href*="#diff-"]'])!;

	const lineUrl = fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${lineNumber}`
		: fileLink.pathname + `#L${lineNumber}`;

	if (isAlteredClick(event)) {
		window.open(lineUrl, '_blank');
	} else {
		location.href = lineUrl;
	}
}

function visuallyLinkify(lineNumberCell: HTMLElement): void {
	lineNumberCell.classList.add('Link--onHover');
}

const lineNumberCellSelector = 'td.blob-num:not(.blob-num-hunk, .empty-cell)';

function init(signal: AbortSignal): void {
	observe(lineNumberCellSelector, visuallyLinkify, {signal});
	delegate(lineNumberCellSelector, 'click', openLinkToLine, {signal});
	onAlteredClick(lineNumberCellSelector, openLinkToLine, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/81

*/
