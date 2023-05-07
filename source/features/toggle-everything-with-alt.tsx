import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import clickAll from '../helpers/click-all.js';

function minimizedCommentsSelector(clickedItem: HTMLElement): string {
	const open = (clickedItem.parentElement as HTMLDetailsElement).open ? '[open]' : ':not([open])';
	return `.minimized-comment > details${open} > summary`;
}

const diffsSelector = '.js-file .js-diff-load';

function resolvedCommentsSelector(clickedItem: HTMLElement): string {
	return `.js-resolvable-thread-toggler[aria-expanded="${clickedItem.getAttribute('aria-expanded')!}"]:not(.d-none)`;
}

const expandSelector = '.js-file .js-expand-full';

const collapseSelector = '.js-file .js-collapse-diff';

const commitMessageSelector = '.TimelineItem .ellipsis-expander';

function markdownCommentSelector(clickedItem: HTMLElement): string {
	const {id} = clickedItem.closest('.TimelineItem-body[id]')!;
	return `#${id} .markdown-body details > summary`;
}

function init(signal: AbortSignal): void {
	// Collapsed comments in PR conversations and files
	delegate('.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector), {signal});

	// "Load diff" buttons in PR files
	delegate(diffsSelector, 'click', clickAll(diffsSelector), {signal});

	// Review comments in PR
	delegate('.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector), {signal});

	// "Expand all" and "Collapse expanded lines" buttons in commit files
	delegate(expandSelector, 'click', clickAll(expandSelector), {signal});
	delegate(collapseSelector, 'click', clickAll(collapseSelector), {signal});

	// Commit message buttons in commit lists and PR conversations
	delegate(commitMessageSelector, 'click', clickAll(commitMessageSelector), {signal});

	// <details> elements in issue/PR comment Markdown content
	delegate('.TimelineItem-body[id] .markdown-body details > summary', 'click', clickAll(markdownCommentSelector), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
		pageDetect.hasFiles,
		pageDetect.isCommitList,
	],
	init,
});
