import './linkify-line-numbers.css';

import delegate, {type DelegateEvent} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';
import * as pageDetect from 'github-url-detection';
import {closestElement} from 'select-dom';

import features from '../feature-manager.js';
import onAlteredClick from '../helpers/on-altered-click.js';

function getLinkToLine(lineNumberCell: HTMLElement): string {
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = closestElement(['.Box', '.review-thread-component'], lineNumberCell)
		.querySelector(['a[href*="#L"]', 'a[href*="#diff-"]'])!;

	return fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${lineNumber}`
		: fileLink.pathname + `#L${lineNumber}`;
}

function openLinkToLine(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	if (!isAlteredClick(event)) {
		location.assign(getLinkToLine(event.delegateTarget));
	}
}

function openLinkToLineInNewTab(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	window.open(getLinkToLine(event.delegateTarget), '_blank');
}

const lineNumberCellSelector = 'td.blob-num:not(.blob-num-hunk, .empty-cell)';

function init(signal: AbortSignal): void {
	delegate(lineNumberCellSelector, 'click', openLinkToLine, {signal});
	onAlteredClick(lineNumberCellSelector, openLinkToLineInNewTab, {signal});
}

void features.addCssFeature(import.meta.url);
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
