import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import PencilIcon from 'octicons-plain-react/Pencil';
import * as pageDetect from 'github-url-detection';
import memoize from 'memoize';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';
import {userIsModerator} from '../github-helpers/get-user-permission.js';

// The signal is only used to memoize calls on the current page. A new page load will use a new signal.
const isIssueIneditable = memoize(
	// If .js-pick-reaction is the first child, `reaction-menu` doesn't exist, which means that the conversation is locked.
	// However, if you can edit every comment, you can still edit the comment
	async (_signal: AbortSignal | undefined): Promise<boolean> => $optional('.js-pick-reaction:first-child') && !await userIsModerator(),
	{
		cache: new WeakMap(),
	},
);

async function addQuickEditButton(commentDropdown: HTMLDetailsElement, {signal}: SignalAsOptions): Promise<void> {
	if (await isIssueIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	const commentBody = commentDropdown.closest('.js-comment')!;

	// TODO: Potentially move to :has selector
	// The comment is definitely not editable
	if (!$optional('.js-comment-update', commentBody)) {
		return;
	}

	// We can't rely on `observe` for deduplication because the anchor might be replaced by GitHub while leaving the edit button behind #5572
	if ($optional('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	commentDropdown.before(
		<button
			type="button"
			role="menuitem"
			className="timeline-comment-action btn-link js-comment-edit-button rgh-quick-comment-edit-button"
			aria-label="Edit comment"
		>
			<PencilIcon />
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	if (await isArchivedRepoAsync()) {
		return;
	}

	// If true then the resulting selector will match all comments, otherwise it will only match those made by you
	const preSelector = await userIsModerator() ? '' : '.current-user';

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

- Regular issue: https://github.com/es-tooling/module-replacements-codemods/issues/6
- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://github.com/eslint/eslint/issues/8213
- Archived repo: https://github.com/fregante/iphone-inline-video/issues/101

*/
