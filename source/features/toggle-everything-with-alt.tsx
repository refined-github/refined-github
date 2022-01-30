import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import clickAll from '../helpers/click-all';

function minimizedCommentsSelector(clickedItem: HTMLElement): string {
	if ((clickedItem.parentElement as HTMLDetailsElement).open) {
		return '.minimized-comment > details[open] > summary';
	}

	return '.minimized-comment > details:not([open]) > summary';
}

function diffsSelector(): string {
	return '.js-file .js-diff-load';
}

function resolvedCommentsSelector(clickedItem: HTMLElement): string {
	return `.js-resolvable-thread-toggler[aria-expanded="${clickedItem.getAttribute('aria-expanded')!}"]:not(.d-none)`;
}

function expandSelector(): string {
	return '.js-file .js-expand-full';
}

function collapseSelector(): string {
	return '.js-file .js-collapse-diff';
}

function commitMessageSelector(): string {
	return '.TimelineItem .ellipsis-expander';
}

function init(): void {
	// Collapsed comments in PR conversations and files
	delegate(document, '.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector));

	// "Load diff" buttons in PR files
	delegate(document, diffsSelector(), 'click', clickAll(diffsSelector));

	// Review comments in PR
	delegate(document, '.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector));

	// "Expand all" and "Collapse expanded lines" buttons in commit files
	delegate(document, expandSelector(), 'click', clickAll(expandSelector));
	delegate(document, collapseSelector(), 'click', clickAll(collapseSelector));

	// Commit message buttons in commit lists and PR conversations
	delegate(document, commitMessageSelector(), 'click', clickAll(commitMessageSelector));
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare,
		pageDetect.isCommitList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
