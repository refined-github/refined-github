import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {PencilIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	// Find editable comments first, then traverse to the correct position
	observe('.js-comment.unminimized-comment .js-comment-update:not(.rgh-edit-comment)', {
		add(comment) {
			comment.classList.add('rgh-edit-comment');

			let discussionsClassname = '';
			if (pageDetect.isDiscussion()) {
				discussionsClassname = 'js-discussions-comment-edit-button';
			}

			comment
				.closest('.js-comment')!
				.querySelector('.timeline-comment-actions > details:last-child, .timeline-comment-actions details:last-child')! // The dropdown
				.before(
					<button
						type="button"
						role="menuitem"
						className={`timeline-comment-action btn-link js-comment-edit-button ${discussionsClassname} rgh-edit-comments-faster-button`}
						aria-label="Edit comment"
					>
						<PencilIcon/>
					</button>
				);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments,
		pageDetect.isDiscussion
	],
	init: onetime(init)
});
