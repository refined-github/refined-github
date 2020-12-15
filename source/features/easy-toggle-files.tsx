import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const toggleFileButtonSelector = '[aria-label="Toggle diff contents"]';

function toggleFile(event: MouseEvent): void {
	const elementClicked = event.target as HTMLElement;
	const headerBar = elementClicked.closest<HTMLElement>('.file-header')!;

	// The clicked element is either the bar itself or one of its 2 children
	if (elementClicked === headerBar || elementClicked.parentElement === headerBar) {
		if (event.altKey) {
			const toggleFileButtonState = select(toggleFileButtonSelector, headerBar)!.getAttribute('aria-expanded');

			for (const button of select.all(toggleFileButtonSelector)) {
				if (button.getAttribute('aria-expanded') === toggleFileButtonState) {
					button.click();
				}
			}
		} else {
			select(toggleFileButtonSelector, headerBar)!.click();
		}
	}
}

async function init(): Promise<void> {
	document.body.addEventListener('click', toggleFile);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	awaitDomReady: false,
	init
});
