import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PencilIcon from 'octicon/pencil.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('details details-menu:not([src]) .js-comment-edit-button:not(.rgh-edit-comment)', {
		add(item) {
			item.classList.add('rgh-edit-comment');

			const button = item.cloneNode();
			button.append(<PencilIcon/>);
			button.classList.replace('dropdown-item', 'timeline-comment-action');
			item.closest('.js-minimizable-comment-group')!.querySelector('.js-comment-header-reaction-button')!.after(button);
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
	waitForDomReady: false,
	init: onetime(init)
});
