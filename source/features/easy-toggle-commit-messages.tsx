import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleCommitMessage(event: MouseEvent): void {
	const elementClicked = event.target as HTMLElement;
	const commitBox = elementClicked.closest('.js-commits-list-item')!;

	// The clicked element is not a button or a link
	if (!elementClicked.closest('a, button, clipboard-copy')) {
		select('.ellipsis-expander', commitBox)!
			.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

async function init(): Promise<void> {
	document.body.addEventListener('click', toggleCommitMessage);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
