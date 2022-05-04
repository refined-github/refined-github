import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import isArchivedRepo from '../helpers/is-archived-repo';

function addQuickEditButton(commentForm: Element): void {
	const commentBody = commentForm.closest('.js-comment')!;
	// We can't rely on a class for deduplication because the whole comment might be replaced by GitHub #5572
	if (select.exists('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	commentBody
		.querySelector('.timeline-comment-actions details.position-relative')! // The dropdown
		.before(
			<button
				type="button"
				role="menuitem"
				className={'timeline-comment-action btn-link js-comment-edit-button rgh-quick-comment-edit-button' + (pageDetect.isDiscussion() ? ' js-discussions-comment-edit-button' : '')}
				aria-label="Edit comment"
			>
				<PencilIcon/>
			</button>,
		);
}

function canEditEveryComment(): boolean {
	return select.exists([
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

function init(): Deinit {
	// If true then the resulting selector will match all comments, otherwise it will only match those made by you
	const preSelector = canEditEveryComment() ? '' : '.current-user';
	// Find editable comments first, then traverse to the correct position
	return observe(preSelector + '.js-comment.unminimized-comment .js-comment-update', {
		add: addQuickEditButton,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
		pageDetect.isDiscussion,
	],
	exclude: [
		isArchivedRepo,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
