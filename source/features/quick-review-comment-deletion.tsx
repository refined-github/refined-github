import React from 'dom-chef';
import select from 'select-dom';
import {TrashIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import loadDetailsMenu from '../github-helpers/load-details-menu';
import attachElement from '../helpers/attach-element';

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
	attachElement({
		anchor: cancelButton,
		append: () => (
			<button className="btn btn-danger float-left rgh-review-comment-delete-button" type="button">
				<TrashIcon/>
			</button>
		),
	});
}

function init(signal: AbortSignal): void {
	delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick, {signal});
	delegate(document, '.rgh-quick-comment-edit-button', 'click', onEditButtonClick, {signal});
	observe('.review-comment .js-comment-cancel-button', addDeleteButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	awaitDomReady: false,
	init,
});
