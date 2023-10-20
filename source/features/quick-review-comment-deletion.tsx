import React from 'dom-chef';
import {$} from 'select-dom';
import {TrashIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import loadDetailsMenu from '../github-helpers/load-details-menu.js';
import showToast from '../github-helpers/toast.js';

function onButtonClick({delegateTarget: button}: DelegateEvent): void {
	try {
		button
			.closest('.js-comment')!
			.querySelector('.show-more-popover .js-comment-delete > button')!
			.click();
	} catch (error) {
		void showToast(new Error('Feature broken. Please open an issue with the link found in the console'));
		features.log.error(import.meta.url, (error as Error).message);
	}
}

async function preloadDropdown({delegateTarget: button}: DelegateEvent): Promise<void> {
	const comment = button.closest('.js-comment')!;
	await loadDetailsMenu($('details-menu.show-more-popover', comment)!);
}

function addDeleteButton(cancelButton: Element): void {
	cancelButton.after(
		<button className="btn btn-danger float-left rgh-review-comment-delete-button" type="button">
			<TrashIcon/>
		</button>,
	);
}

function init(signal: AbortSignal): void {
	delegate('.rgh-review-comment-delete-button', 'click', onButtonClick, {signal});
	delegate('.rgh-quick-comment-edit-button', 'click', preloadDropdown, {signal});
	observe('.review-comment .js-comment-cancel-button', addDeleteButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	init,
});
