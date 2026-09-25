import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import TrashIcon from 'octicons-plain-react/Trash';
import {$, $optional, closestElement} from 'select-dom';
import {assertError} from 'ts-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import loadDetailsMenu from '../github-helpers/load-details-menu.js';
import showToast from '../github-helpers/toast.js';
import observe from '../helpers/selector-observer.js';

function getCommentId(comment: HTMLElement): string {
	// Legacy view: `id="discussion_r123"`. New Files view: `id="r123"`
	const match = /^(?:discussion_)?r(?<id>\d+)$/.exec(comment.id);
	if (!match) {
		throw new Error('Comment ID not found');
	}

	return match.groups!.id;
}

async function deleteViaApi(comment: HTMLElement): Promise<void> {
	if (!confirm('Are you sure you want to delete this comment?')) {
		return;
	}

	await api.v3(`pulls/comments/${getCommentId(comment)}`, {
		method: 'DELETE',
		responseFormat: 'text',
	});
	comment.remove();
}

async function onButtonClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const comment = closestElement([
		// TODO [2027-01-01]: Drop after legacy PR files view is removed
		'.js-comment',
		'[data-marker-navigation-comment-id^="PRRC_"]', // New Files view
	], button);
	// The new Files view has no native delete item in the DOM
	const nativeDeleteButton = $optional(':scope .show-more-popover .js-comment-delete > button', comment);
	if (nativeDeleteButton) {
		nativeDeleteButton.click();
		return;
	}

	// GitHub also drops the native delete item after a comment is hidden, until the page is reloaded
	// https://github.com/refined-github/refined-github/issues/9040
	try {
		await deleteViaApi(comment);
	} catch (error) {
		assertError(error);
		void showToast(error);
		throw error;
	}
}

async function preloadDropdown({delegateTarget: button}: DelegateEvent): Promise<void> {
	const comment = closestElement('.js-comment', button);
	await loadDetailsMenu($('details-menu.show-more-popover', comment));
}

function addDeleteButton(cancelButton: Element): void {
	cancelButton.before(
		// Not delegated: the new Files view stops click propagation
		<button
			className="btn btn-danger float-left mr-auto rgh-review-comment-delete-button"
			type="button"
			onClick={onButtonClick}
		>
			<TrashIcon />
		</button>,
	);
}

function init(signal: AbortSignal): void {
	delegate('.rgh-quick-comment-edit-button', 'click', preloadDropdown, {signal});
	observe(
		[
			// TODO [2027-01-01]: Drop after legacy PR files view is removed
			'.review-comment .js-comment-cancel-button',
			'[data-marker-navigation-comment-id^="PRRC_"] [data-testid="markdown-editor-footer"] [class^="Footer-module__childrenStyling"] > button:first-child:not(.rgh-review-comment-delete-button)', // New Files view
		],
		addDeleteButton,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	init,
});

/*

Test URLs

- https://github.com/refined-github/sandbox/pull/31
- https://github.com/refined-github/sandbox/pull/31/files
- https://github.com/refined-github/sandbox/pull/31/changes

*/
