import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {TrashIcon} from '@primer/octicons-react';

import features from '.';
import onFragmentLoad from '../github-events/on-fragment-load';

const deinit: VoidFunction[] = [];

async function onButtonClick(event: delegate.Event): Promise<void> {
	const comment = event.delegateTarget.closest<HTMLElement>('.js-comment')!;
	await onFragmentLoad(select('include-fragment.SelectMenu-loading', comment), select('.timeline-comment-actions > details:last-of-type', comment)!);

	select('.dropdown-menu .js-comment-delete > button', comment)!.click();
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
	const observer = observe('.review-comment > .unminimized-comment form:not(.js-single-suggested-change-form) .js-comment-cancel-button:not(.rgh-delete-button-added)', {
		add: addDeleteButton
	});
	deinit.push(listener.destroy, observer.abort);
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
