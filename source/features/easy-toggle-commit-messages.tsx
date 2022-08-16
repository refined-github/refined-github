import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';

function toggleCommitMessage(event: DelegateEvent<MouseEvent>): void {
	const elementClicked = event.target as HTMLElement;
	// The clicked element is not a button, a link or a popup ("Verified" badge, CI details, etc.)
	if (!elementClicked.closest('a, button, clipboard-copy, details')) {
		select('.ellipsis-expander', event.delegateTarget)?.dispatchEvent(
			new MouseEvent('click', {bubbles: true, altKey: event.altKey}),
		);
	}
}

const commitMessagesSelector = [
	'.js-commits-list-item',
	':is(.file-navigation, .js-permalink-shortcut) ~ .Box .Box-header', // Commit message in file tree header
].join(',');

function init(signal: AbortSignal): void {
	delegate(document, commitMessagesSelector, 'click', toggleCommitMessage, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isCompare,
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: false,
	init,
});
