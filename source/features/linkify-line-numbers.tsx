import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$closest} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function linkify(lineNumberCell: HTMLTableCellElement): void {
	const {lineNumber} = lineNumberCell.dataset;
	const fileLink = $closest(['.Box', '.review-thread-component'], lineNumberCell)
		.querySelector(['a[href*="#L"]', 'a[href*="#diff-"]'])!;

	const url = fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${lineNumber}`
		: fileLink.pathname + `#L${lineNumber}`;

	lineNumberCell.append(
		<a href={url} className="fgColor-inherit no-underline Link--onHover">
			{lineNumber}
		</a>,
	);

	lineNumberCell.dataset.lineNumber = '';
}

function init(signal: AbortSignal): void {
	observe('.blob-num:empty:not(.blob-num-hunk)', linkify, {signal});
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
