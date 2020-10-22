import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const expanderSelector = '.js-expand.directional-expander';

// Waits for the next loaded diff part and clicks on any additional "Expand" buttons it finds
const expandingCodeObserver = new MutationObserver(([mutation]) => {
	const expandButton = select(expanderSelector, mutation.target as Element);
	if (expandButton) {
		expandButton.click();
	} else {
		document.body.removeEventListener('keyup', disconnectOnEscape);
		expandingCodeObserver.disconnect();
	}
});

function disconnectOnEscape(event: KeyboardEvent): void {
	if (event.key === 'Escape') {
		document.body.removeEventListener('keyup', disconnectOnEscape);
		expandingCodeObserver.disconnect();
	}
}

function handleAltClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	if (!event.altKey) {
		return;
	}

	document.body.addEventListener('keyup', disconnectOnEscape);

	expandingCodeObserver.observe(
		event.delegateTarget.closest('.diff-table > tbody')!,
		{childList: true}
	);
}

function init(): void {
	delegate(document, expanderSelector, 'click', handleAltClick);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.isPRCommit,
		pageDetect.isPRFiles,
		pageDetect.isSingleCommit
	],
	init
});
