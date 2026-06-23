import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import memoize from 'memoize';
import PencilIcon from 'octicons-plain-react/Pencil';
import {$, closestElement, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import {userIsModerator} from '../github-helpers/get-user-permission.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';
import withMenuOpen from '../github-helpers/with-menu-open.js';
import observe from '../helpers/selector-observer.js';
import {tooltipped} from '../helpers/tooltip.js';

// The signal is only used to memoize calls on the current page. A new page load will use a new signal.
const isConversationIneditable = memoize(
	async (_signal: AbortSignal | undefined): Promise<boolean> => elementExists([
		'[class*="ReadonlyCommentBox-module"]',
		// If .js-pick-reaction is the first child, `reaction-menu` doesn't exist, which means that the conversation is locked.
		// However, if you can edit every comment, you can still edit the comment
		'.js-pick-reaction:first-child',
	]) && !await userIsModerator(),
	{
		cache: new WeakMap(),
	},
);

const editMenuItemSelector = 'li[data-component="ActionList.Item"]:has(.octicon-pencil)';

async function addQuickEditButton(menuButon: HTMLButtonElement, {signal}: SignalAsOptions): Promise<void> {
	if (await isConversationIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	menuButon.before(
		tooltipped('Edit comment',
			<button
				type="button"
				className="Button Button--iconOnly Button--invisible Button--small"
				onClick={async () => withMenuOpen(menuButon, menu => {
					$(editMenuItemSelector, menu).click();
					menuButon.previousElementSibling!.remove();
				})}
			>
				<PencilIcon />
			</button>,
		));
}

async function addQuickEditButtonLegacy(commentDropdown: HTMLDetailsElement, {signal}: SignalAsOptions): Promise<void> {
	if (await isConversationIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	const commentBody = closestElement('.js-comment', commentDropdown);

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
			<PencilIcon />
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	if (await isArchivedRepoAsync()) {
		return;
	}

	const isUserModerator = await userIsModerator();

	observe(
		(isUserModerator ? '' : 'div[class*="viewerDidAuthor"]')
		+ ' button[aria-haspopup="true"]:is([data-testid="comment-header-hamburger"], [class^="IssueBodyHeader-module__actionsSection"] > *)',
		addQuickEditButton,
		{signal},
	);

	observe(
		(isUserModerator ? '' : '.current-user')
		+ '.js-comment.unminimized-comment .timeline-comment-actions details.position-relative',
		addQuickEditButtonLegacy,
		{signal},
	);
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
