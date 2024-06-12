import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';

import features from '../feature-manager.js';

function openLinkToLine(event: DelegateEvent<MouseEvent, HTMLTableCellElement>): void {
	const lineNumber = event.delegateTarget;
	const {pathname} = lineNumber.closest('.Box')!.querySelector('a[href*="#L"]')!;
	const url = pathname + `#L${lineNumber.dataset.lineNumber}`;
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

