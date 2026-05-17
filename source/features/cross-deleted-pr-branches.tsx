import './cross-deleted-pr-branches.css';

import * as pageDetect from 'github-url-detection';
import {$$, $closest, lastElementOptional} from 'select-dom';

import features from '../feature-manager.js';

function markDeletedBranch(element: HTMLElement): void {
	element.title = 'This branch has been deleted';
	element.classList.add('rgh-deleted-branch');
}

function wasBranchDeleted(): boolean {
	const lastBranchEvent = lastElementOptional('.TimelineItem-body .user-select-contain.commit-ref');
	return Boolean(lastBranchEvent) // No branch events at all
		&& $closest('.TimelineItem-body', lastBranchEvent).textContent.includes(' deleted ');
}

function parseBranchName(element: HTMLElement): string {
	return element.textContent.trim().split(':').pop()!;
}

function init(): void {
	// There's static and sticky headers
	const [header1, header2] = $$('a:has(~ [aria-label="Copy head branch name to clipboard"])');
	markDeletedBranch(header1);
	markDeletedBranch(header2);

	const deletedBranchName = parseBranchName(header1);
	for (const element of $$('.commit-ref')) {
		// The selector might also match the base branch in "PR was rebased" events
		if (parseBranchName(element) === deletedBranchName) {
			markDeletedBranch(element);
		}
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		wasBranchDeleted,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // Must wait for the last one
	init,
});

/*

Test URLs:

- 🔗 never deleted: https://github.com/refined-github/sandbox/pull/148
- ✏️ deleted: https://github.com/refined-github/sandbox/pull/146
- ✏️ deleted (from fork): https://github.com/refined-github/sandbox/pull/149
- 🔗 deleted and restored: https://github.com/refined-github/sandbox/pull/147
- 🔗 deleted and restored (on fork): https://github.com/refined-github/sandbox/pull/150

*/
