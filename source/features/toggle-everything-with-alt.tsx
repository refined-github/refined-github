import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import clickAll from '../helpers/click-all';

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

function init(): Deinit[] {
	return [
		// Collapsed comments in PR conversations and files
		delegate(document, '.minimized-comment details summary', 'click', clickAll(minimizedCommentsSelector)),

		// "Load diff" buttons in PR files
		delegate(document, diffsSelector, 'click', clickAll(diffsSelector)),

		// Review comments in PR
		delegate(document, '.js-file .js-resolvable-thread-toggler', 'click', clickAll(resolvedCommentsSelector)),

		// "Expand all" and "Collapse expanded lines" buttons in commit files
		delegate(document, expandSelector, 'click', clickAll(expandSelector)),
		delegate(document, collapseSelector, 'click', clickAll(collapseSelector)),

		// Commit message buttons in commit lists and PR conversations
		delegate(document, commitMessageSelector, 'click', clickAll(commitMessageSelector)),

		// <details> elements in issue/PR comment Markdown content
		delegate(document, '.TimelineItem-body[id] .markdown-body details > summary', 'click', clickAll(markdownCommentSelector)),
	];
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
