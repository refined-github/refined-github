import React from 'dom-chef';
import onetime from 'onetime';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function deleteComment(comment: HTMLElement): void {
	select('.dropdown-menu .js-comment-delete > button', comment)!.click();
}

function onButtonClick(event: delegate.Event): void {
	const comment = event.delegateTarget.closest<HTMLElement>('.js-comment')!;
	const dropdownFragment = select('include-fragment.SelectMenu-loading', comment);
	if (dropdownFragment) {
		select('.timeline-comment-actions > details:last-of-type', comment)!.dispatchEvent(new Event('mouseover'));
		dropdownFragment.addEventListener('load', () => {
			deleteComment(comment);
		});
		return;
	}

	deleteComment(comment);
}

function init(): void {
	delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick);
	observe('.review-comment > .unminimized-comment .btn-primary[type="submit"]:not(.rgh-delete-button-added)', {
		add(submitButton) {
			submitButton.classList.add('rgh-delete-button-added');
			submitButton.after(
				<button className="btn btn-danger rgh-review-comment-delete-button" type="button">
					Delete comment
				</button>
			);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init: onetime(init)
});
