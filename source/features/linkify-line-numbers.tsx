import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';

import features from '../feature-manager.js';

function openLinkToLine(event: DelegateEvent<MouseEvent, HTMLTableCellElement>): void {
	const cell = event.delegateTarget;
	const fileLink = cell.closest('.Box,.review-thread-component')!.querySelector('a[href*="#L"],a[href*="#diff-"]')!;
	const url = fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${cell.dataset.lineNumber}`
		: fileLink.pathname + `#L${cell.dataset.lineNumber}`;

	if (isAlteredClick(event)) {
		window.open(url);
	} else {
		window.location.href = url;
	}
}

function init(signal: AbortSignal): void {
	delegate('td[data-line-number]:empty', 'click', openLinkToLine, {signal});
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
