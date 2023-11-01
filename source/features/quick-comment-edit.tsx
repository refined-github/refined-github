import './quick-comment-edit.css';
import React from 'dom-chef';
import {elementExists} from 'select-dom';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {isArchivedRepoAsync} from '../github-helpers/index.js';

function addQuickEditButton(commentForm: Element): void {
	const commentBody = commentForm.closest('.js-comment')!;
	// We can't rely on a class for deduplication because the whole comment might be replaced by GitHub #5572
	if (elementExists('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	commentBody
		.querySelector('.timeline-comment-actions details.position-relative')! // The dropdown
		.before(
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

	// Find editable comments first, then traverse to the correct position
	// TODO: Replace with :has selector
	observe(preSelector + '.js-comment.unminimized-comment .js-comment-update', addQuickEditButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	// The feature is "disabled" via CSS selector when the conversation is locked.
	// We want the edit buttons to appear while the conversation is loading, but we only know it's locked when the page has finished.
	init,
});
