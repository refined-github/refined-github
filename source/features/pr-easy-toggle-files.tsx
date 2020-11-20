import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const selectorHeaderBar = '.file-header.file-header--expandable';

function toggleFile(event: delegate.Event<Event, HTMLElement>): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = elementClicked.closest(selectorHeaderBar);

	// The clicked element is either the bar itself or one of its 2 children
	if (
		elementClicked.isSameNode(headerBar) ||
		elementClicked.parentElement!.isSameNode(headerBar)
	) {
		select('.file-info > button', headerBar as HTMLElement)!.click();
	}
}

async function init(): Promise<void> {
	delegate('#files', selectorHeaderBar, 'click', toggleFile);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init
});
