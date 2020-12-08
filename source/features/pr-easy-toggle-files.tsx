import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: Event): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = elementClicked.closest<HTMLElement>('.file-header')!;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('[aria-label="Toggle diff contents"]', headerBar)!.click();
	}
}

async function init(): Promise<void> {
	document.body.addEventListener('click', toggleFile);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	awaitDomReady: false,
	init
});
