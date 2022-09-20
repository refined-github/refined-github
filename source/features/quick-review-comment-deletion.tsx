import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import {TrashIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import loadDetailsMenu from '../github-helpers/load-details-menu';

async function onButtonClick({delegateTarget: button}: DelegateEvent): Promise<void> {
	button
		.closest('.js-comment')!
		.querySelector('.show-more-popover .js-comment-delete > button')!
		.click();
}

async function onEditButtonClick({delegateTarget: button}: DelegateEvent): Promise<void> {
	const comment = button.closest('.js-comment')!;
	await loadDetailsMenu(select('details-menu.show-more-popover', comment)!);
}

function addDeleteButton(cancelButton: Element): void {
	cancelButton.classList.add('rgh-delete-button-added');
	cancelButton.after(
		<button className="btn btn-danger float-left rgh-review-comment-delete-button" type="button">
			<TrashIcon/>
		</button>,
	);
}

function init(signal: AbortSignal): Deinit {
	delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick, {signal});
	delegate(document, '.rgh-quick-comment-edit-button', 'click', onEditButtonClick, {signal});

	return observe('.review-comment .js-comment-cancel-button:not(.rgh-delete-button-added)', {
		add: addDeleteButton,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	init,
});
