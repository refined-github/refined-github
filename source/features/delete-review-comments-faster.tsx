import './delete-review-comments-faster.css';

import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onFragmentLoad from '../github-events/on-fragment-load';

const deinit: VoidFunction[] = [];

async function onButtonClick(event: delegate.Event): Promise<void> {
	const comment = event.delegateTarget.closest<HTMLElement>('.js-comment')!;
	await onFragmentLoad(select('include-fragment.SelectMenu-loading', comment), select('.timeline-comment-actions > details:last-of-type', comment)!);

	select('.dropdown-menu .js-comment-delete > button', comment)!.click();
}

function addDeleteButton(submitButton: Element): void {
	submitButton.classList.add('rgh-delete-button-added');
	submitButton.parentElement!.classList.add('d-flex', 'flex-row-reverse', 'flex-justify-between', 'rgh-delete-button-form');
	submitButton.after(
		<button className="btn btn-danger rgh-review-comment-delete-button" type="button">
			Delete comment
		</button>
	);
}

function init(): void {
	const listener = delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick);
	const observer = observe('.review-comment > .unminimized-comment form:not(.js-single-suggested-change-form) .btn-primary[type="submit"]:not(.rgh-delete-button-added)', {
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
