import React from 'dom-chef';
import {elementExists} from 'select-dom';
import PencilIcon from 'octicons-plain-react/Pencil';
import * as pageDetect from 'github-url-detection';
import {isChrome} from 'webext-detect-page';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';

function addQuickEditButton(commentDropdown: HTMLDetailsElement): void {
	const commentBody = commentDropdown.closest('.js-comment')!;

	// TODO: Potentially move to :has selector
	// The comment is definitely not editable
	if (!elementExists('.js-comment-update', commentBody)) {
		console.log('Comment is not editable');
		return;
	}

	// We can't rely on a class for deduplication because the whole comment might be replaced by GitHub #5572
	if (elementExists('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	// If .js-pick-reaction is the first child, `reaction-menu` doesn't exist, which means that the conversation is locked.
	// However, if you can edit every comment, you can still edit the comment
	if (elementExists('.js-pick-reaction:first-child', commentBody) && !canEditEveryComment()) {
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
		isChrome,
	],
	include: [
		pageDetect.hasComments,
	],
	// The feature is "disabled" via CSS selector when the conversation is locked.
	// We want the edit buttons to appear while the conversation is loading, but we only know it's locked when the page has finished.
	init,
});

/*
Test URLs:

- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://github.com/eslint/eslint/issues/8213

*/
