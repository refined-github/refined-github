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

			comment.closest('.js-comment')!.querySelector('.js-comment-header-reaction-button')!.after(
				<button
					type="button"
					role="menuitem"
					className="timeline-comment-action btn-link js-comment-edit-button"
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
		pageDetect.hasComments
	],
	init: onetime(init)
});
