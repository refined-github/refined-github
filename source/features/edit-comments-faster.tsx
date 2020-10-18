import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PencilIcon from 'octicon/pencil.svg';
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

void features.add({
	id: __filebasename,
	description: 'Lets you edit any comment with one click instead of having to open a dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init: onetime(init)
});
