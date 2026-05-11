import * as pageDetect from 'github-url-detection';
import {$closest} from 'select-dom';

import features from '../feature-manager.js';
import replaceElementTypeInPlace from '../helpers/recreate-element.js';
import observe from '../helpers/selector-observer.js';

function linkify(lineNumberCell: HTMLTableCellElement): void {
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = $closest(['.Box', '.review-thread-component'], lineNumberCell)
		.querySelector(['a[href*="#L"]', 'a[href*="#diff-"]'])!;

	const lineUrl = fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${lineNumber}`
		: fileLink.pathname + `#L${lineNumber}`;

	const linkified = replaceElementTypeInPlace(lineNumberCell, 'a');
	linkified.href = lineUrl;
	linkified.classList.add('d-table-cell', 'no-underline', 'Link--onHover');
}

function init(signal: AbortSignal): void {
	observe('.blob-num:not(.blob-num-hunk, .empty-cell)', linkify, {signal});
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
