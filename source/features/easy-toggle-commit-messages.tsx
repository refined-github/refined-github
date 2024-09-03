import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

const activeElementsSelector = 'a, button, clipboard-copy, details';

function toggleCommitMessage(event: DelegateEvent<MouseEvent>): void {
	// The clicked element is a button, a link or a popup ("Verified" badge, CI details, etc.)
	const elementClicked = event.target as HTMLElement;
	if (elementClicked.closest(activeElementsSelector)) {
		return;
	}

	// There is text selection
	if (window.getSelection()?.toString().length !== 0) {
		return;
	}

	$('[data-testid="commit-row-show-description-button"]', event.delegateTarget)?.dispatchEvent(
		new MouseEvent('click', {bubbles: true, altKey: event.altKey}),
	);
}

function toggleLatestCommitMessage(event: DelegateEvent<MouseEvent>): void {
	// The clicked element is a button, a link or a popup ("Verified" badge, CI details, etc.)
	const elementClicked = event.target as HTMLElement;
	if (elementClicked.closest(activeElementsSelector)) {
		return;
	}

	// There is text selection
	if (window.getSelection()?.toString().length !== 0) {
		return;
	}

	$('[data-testid="latest-commit-details-toggle"]', event.delegateTarget)?.dispatchEvent(
		new MouseEvent('click', {bubbles: true, altKey: event.altKey}),
	);
}

function init(signal: AbortSignal): void {
	delegate('[data-testid="commit-row-item"]', 'click', toggleCommitMessage, {signal});
	delegate('[data-testid="latest-commit"]', 'click', toggleLatestCommitMessage, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isCompare,
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs:

- Commit list: https://github.com/refined-github/refined-github/commits/main/?after=384131b0be3d4097f7cc633f76aecd43f1292471+69
- File/folder: https://github.com/refined-github/sandbox/tree/254a81ef488dcb3866cf8a4cacde501d9faaa588/.github/workflows

How to test:

1. Ensure that clicking the ellipsis can still expand/elide the commit message correctly.
2. Ensure that clicking next to the ellipsis can also expand/elide the commit message.
3. Ensure that clicking on the expanded commit message can elide it.
4. Ensure that selecting texts in the expanded commit message would not elide it.

*/
