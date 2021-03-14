import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function onButtonClick(event: delegate.Event): void {
	select('.dropdown-menu .js-comment-delete > button', (event.target as HTMLElement).closest('.js-comment')!)!.click();
}

function init(): void {
	delegate(document, '.rgh-review-comment-delete-button', 'click', onButtonClick);

	observe('.review-comment > :not(.minimized-comment) .btn-primary[type="submit"]', {
		add(submitButton) {
			if (submitButton.classList.contains('rgh-delete-button-added')) {
				return;
			}

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
	init
});
