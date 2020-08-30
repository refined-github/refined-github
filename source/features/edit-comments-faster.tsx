import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PencilIcon from 'octicon/pencil.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('.current-user .js-comment-header-reaction-button:not(.rgh-edit-comment)', {
		add(reactions) {
			reactions.classList.add('rgh-edit-comment');

			reactions.after(
				<button type="button" role="menuitem" className="timeline-comment-action btn-link js-comment-edit-button" aria-label="Edit comment">
					<PencilIcon/>
				</button>
			);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Moves the `Edit comment` button out of the `...` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init: onetime(init)
});
