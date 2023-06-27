import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function toggleCommitMessage(event: DelegateEvent<MouseEvent>): void {
	// The clicked element is a button, a link or a popup ("Verified" badge, CI details, etc.)
	const elementClicked = event.target as HTMLElement;
	if (elementClicked.closest('a, button, clipboard-copy, details')) {
		return;
	}

	// There is text selection
	if (window.getSelection()?.toString().length !== 0) {
		return;
	}

	select('.ellipsis-expander', event.delegateTarget)?.dispatchEvent(
		new MouseEvent('click', {bubbles: true, altKey: event.altKey}),
	);
}

const commitMessagesSelector = [
	'.js-commits-list-item',
	':is(.file-navigation, .js-permalink-shortcut) ~ .Box .Box-header', // Commit message in file tree header
].join(',');

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
	init,
});
