import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: MouseEvent): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = elementClicked.closest<HTMLElement>('.file-header')!;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('[aria-label="Toggle diff contents"]', headerBar)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

async function init(): Promise<void> {
	document.body.addEventListener('click', toggleFile);
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
