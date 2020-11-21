import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleFile(event: Event): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = elementClicked.closest<HTMLElement>('.file-header.file-header--expandable')!;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		select('.file-info > button', headerBar)!.click();
	}
}

async function init(): Promise<void> {
	document.body.addEventListener('click', toggleFile);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init
});
