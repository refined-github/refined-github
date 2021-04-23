import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import {TrashIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onFragmentLoad from '../github-events/on-fragment-load';

const deinit: VoidFunction[] = [];

async function onButtonClick({delegateTarget: button}: delegate.Event): Promise<void> {
	select('.dropdown-menu .js-comment-delete > button', button.closest<HTMLElement>('.js-comment')!)!.click();
}

async function onEditButtonClick({delegateTarget: button}: delegate.Event): Promise<void> {
	const comment = button.closest<HTMLElement>('.js-comment')!;
	await onFragmentLoad(select('include-fragment.SelectMenu-loading', comment), select('.timeline-comment-actions > details:last-of-type', comment)!);
}

function addDeleteButton(cancelButton: Element): void {
	cancelButton.classList.add('rgh-delete-button-added');
	cancelButton.after(
		<button className="btn btn-danger float-left rgh-review-comment-delete-button" type="button">
			<TrashIcon/>
		</button>
	);
}

function init(): void {
	const listener = delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick);
	const editButtonListener = delegate(document, '.rgh-edit-comments-faster-button', 'click', onEditButtonClick);
	const observer = observe('.review-comment > .unminimized-comment form:not(.js-single-suggested-change-form) .js-comment-cancel-button:not(.rgh-delete-button-added)', {
		add: addDeleteButton
	});
	deinit.push(listener.destroy, editButtonListener.destroy, observer.abort);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init,
	deinit
});
