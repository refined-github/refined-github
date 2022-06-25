import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function toggleCommitMessage(event: delegate.Event<MouseEvent>): void {
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

function init(): Deinit {
	return delegate(document, commitMessagesSelector, 'click', toggleCommitMessage);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isCompare,
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
