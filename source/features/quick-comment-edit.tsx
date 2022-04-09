import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import isArchivedRepo from '../helpers/is-archived-repo';

function addQuickEditButton(commentForm: Element): void {
	// We can't rely on a class for deduplication because the whole comment might be replaced by GitHub #5572
	if (select.exists('.rgh-quick-comment-edit-button', commentForm)) {
		return;
	}

	const buttonClasses = [
		'timeline-comment-action btn-link js-comment-edit-button rgh-quick-comment-edit-button',
		pageDetect.isIssue() ? 'pl-0' : '', // Compensate whitespace node in issue comments header https://github.com/refined-github/refined-github/pull/5580#discussion_r845354681
		pageDetect.isDiscussion() ? 'js-discussions-comment-edit-button' : '',
	].join(' ');

	commentForm
		.closest('.js-comment')!
		.querySelector('.timeline-comment-actions > details:last-child')! // The dropdown
		.before(
			<button
				type="button"
				role="menuitem"
				className={buttonClasses}
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
