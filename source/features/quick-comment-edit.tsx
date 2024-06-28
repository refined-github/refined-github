import React from 'dom-chef';
import {elementExists} from 'select-dom';
import PencilIcon from 'octicons-plain-react/Pencil';
import * as pageDetect from 'github-url-detection';
import memoize from 'memoize';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';

// The signal is only used to memoize calls on the current page. A new page load will use a new signal.
const isIssueIneditable = memoize(
	// If .js-pick-reaction is the first child, `reaction-menu` doesn't exist, which means that the conversation is locked.
	// However, if you can edit every comment, you can still edit the comment
	(_signal: AbortSignal | undefined): boolean => elementExists('.js-pick-reaction:first-child') && !canEditEveryComment(),
	{
		cache: new WeakMap(),
	},
);

function addQuickEditButton(commentDropdown: HTMLDetailsElement, {signal}: SignalAsOptions): void {
	if (isIssueIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	const commentBody = commentDropdown.closest('.js-comment')!;

	// TODO: Potentially move to :has selector
	// The comment is definitely not editable
	if (!elementExists('.js-comment-update', commentBody)) {
		return;
	}

	// We can't rely on `observe` for deduplication because the anchor might be replaced by GitHub while leaving the edit button behind #5572
	if (elementExists('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	commentDropdown.before(
		<button
			type="button"
			role="menuitem"
			className="timeline-comment-action btn-link js-comment-edit-button rgh-quick-comment-edit-button"
			aria-label="Edit comment"
		>
			<PencilIcon/>
		</button>,
	);
}

export function canEditEveryComment(): boolean {
	return elementExists([
		// If you can lock conversations, you have write access
		'.lock-toggle-link > .octicon-lock',

		// Some pages like `isPRFiles` does not have a lock button
		// These elements only exist if you commented on the page
		'[aria-label^="You have been invited to collaborate"]',
		'[aria-label^="You are the owner"]',
		'[title^="You are a maintainer"]',
		'[title^="You are a collaborator"]',
	]) || pageDetect.canUserEditRepo();
}

async function init(signal: AbortSignal): Promise<void> {
	if (await isArchivedRepoAsync()) {
		return;
	}

	// If true then the resulting selector will match all comments, otherwise it will only match those made by you
	const preSelector = canEditEveryComment() ? '' : '.current-user';

	observe(preSelector + '.js-comment.unminimized-comment .timeline-comment-actions details.position-relative', addQuickEditButton, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isLoggedIn,
	],
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*
Test URLs:

- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://github.com/eslint/eslint/issues/8213

*/
