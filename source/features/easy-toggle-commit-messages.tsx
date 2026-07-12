import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {$optional, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';

export function wasInteractiveElementClicked(event: DelegateEvent<MouseEvent>): boolean {
	return Boolean(
		closestElementOptional(
			['a', 'button', 'clipboard-copy', 'details'],
			event.target as HTMLElement,
		),
	);
}

function toggleCommitMessage(event: DelegateEvent<MouseEvent>): void {
	if (wasInteractiveElementClicked(event)) {
		return;
	}

	// There is text selection
	if (getSelection()?.toString().length !== 0) {
		return;
	}

	// We might reach this point even if there's no toggle button, so use $optional
	$optional([
		'[data-testid="commit-row-show-description-button"]', // Commit list
		'[data-testid="latest-commit-details-toggle"]', // File/folder
		'.ellipsis-expander', // Compare
	], event.delegateTarget)?.dispatchEvent(
		new MouseEvent('click', {bubbles: true, altKey: event.altKey}),
	);
}

const commitMessagesSelector = [
	'[data-testid="commit-row-item"]',
	'[data-testid="latest-commit"]', // Commit message in file tree header
	'.js-commits-list-item', // Compare
];

function init(signal: AbortSignal): void {
	delegate(commitMessagesSelector, 'click', toggleCommitMessage, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isCompare,
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.is404,
	],
	init,
});

/*

Test URLs:

- Repo root: https://github.com/refined-github/sandbox/tree/254a81ef488dcb3866cf8a4cacde501d9faaa588
- Commit list: https://github.com/refined-github/refined-github/commits/main/?after=384131b0be3d4097f7cc633f76aecd43f1292471+69
- File/folder: https://github.com/refined-github/sandbox/tree/254a81ef488dcb3866cf8a4cacde501d9faaa588/.github/workflows
- Compare: https://github.com/refined-github/sandbox/compare/default-a...Dont-mess

How to test:

1. Ensure that clicking the ellipsis can still expand/elide the commit message correctly.
2. Ensure that clicking next to the ellipsis can also expand/elide the commit message.
3. Ensure that clicking on the expanded commit message can elide it.
4. Ensure that selecting texts in the expanded commit message would not elide it.

*/
