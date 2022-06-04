import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import {TrashIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import loadDetailsMenu from '../github-helpers/load-details-menu';

async function onButtonClick({delegateTarget: button}: delegate.Event): Promise<void> {
	button
		.closest('.js-comment')!
		.querySelector('.show-more-popover .js-comment-delete > button')!
		.click();
}

async function onEditButtonClick({delegateTarget: button}: delegate.Event): Promise<void> {
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

function init(): Deinit[] {
	return [
		delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick),
		delegate(document, '.rgh-quick-comment-edit-button', 'click', onEditButtonClick),
		observe('.review-comment > .unminimized-comment form:not(.js-single-suggested-change-form) .js-comment-cancel-button:not(.rgh-delete-button-added)', {
			add: addDeleteButton,
		}),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
