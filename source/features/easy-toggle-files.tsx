import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = event.delegateTarget;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('[aria-label="Toggle diff contents"]', headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(signal: AbortSignal): void {
	delegate(document, '.file-header', 'click', toggleFile, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasFiles,
		pageDetect.isGistRevision,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
