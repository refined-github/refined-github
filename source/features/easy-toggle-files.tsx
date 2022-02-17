import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: delegate.Event<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('[aria-label="Toggle diff contents"]', headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

async function init(): Promise<void> {
	delegate(document, '.file-header', 'click', toggleFile);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
