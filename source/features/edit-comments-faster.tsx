import React from 'dom-chef';
import select from 'select-dom';
import PencilIcon from 'octicon/pencil.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void | false {
	const menuItems = select.all('details .js-comment-edit-button:not(.rgh-edit-comment)');

	for (const item of menuItems) {
		item.classList.add('rgh-edit-comment');

		const button = item.cloneNode();
		button.append(<PencilIcon/>);
		button.classList.replace('dropdown-item', 'timeline-comment-action');
		// Prevent duplicate icon in review comments
		if (item.closest('details-menu[src]')) return false;
		(
			item.closest('.review-comment')?.querySelector('.js-comment .timeline-comment-actions')!.lastElementChild ??
			item
		).closest('details')!.before(button);
	}
}

void features.add({
	id: __filebasename,
	description: 'Moves the `Edit comment` button out of the `...` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
