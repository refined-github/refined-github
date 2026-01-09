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

const commitMessageSelector = 'button[data-testid="commit-row-show-description-button"]';

const addSuggestionToBatchSelector = ':is(.js-apply-changes button[data-variant="primary"], .js-batched-suggested-changes-add)';

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

	// "Add suggestion to batch" buttons in PR files
	delegate(addSuggestionToBatchSelector, 'click', clickAll(addSuggestionToBatchSelector), {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
		pageDetect.hasFiles,
		pageDetect.isCommitList,
		pageDetect.isPRFiles,
	],
	init,
});

/*

Test URLs:

Collapsed comments:
- PR conversations: https://github.com/refined-github/refined-github/pull/1694
- PR files: https://github.com/refined-github/refined-github/pull/1896/files
- Issue conversations: https://github.com/refined-github/refined-github/issues/4008

Load diff in PR files: https://github.com/parcel-bundler/parcel/pull/2967/files
Expand all in PR files: https://github.com/refined-github/refined-github/pull/4585/files

Commit messages:
- isPRConversation: https://github.com/refined-github/refined-github/pull//5324
- isCommitList: https://github.com/torvalds/linux/commits/master

<details> elements:
- Issue: https://github.com/yakov116/TestR/issues/34
- PR description: https://github.com/OpenLightingProject/open-fixture-library/pull/2455
- PR comment: https://github.com/OpenLightingProject/open-fixture-library/pull/2453#issuecomment-1055672394

Add suggestion to batch: https://github.com/refined-github/sandbox/pull/121/changes
*/
