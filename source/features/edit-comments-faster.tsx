import React from 'dom-chef';
import select from 'select-dom';
import PencilIcon from 'octicon/pencil.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	const menuItems = select.all('details .js-comment-edit-button:not(.rgh-edit-comment)');

	for (const item of menuItems) {
		item.classList.add('rgh-edit-comment');

		const button = item.cloneNode();
		button.append(<PencilIcon/>);
		button.classList.replace('dropdown-item', 'timeline-comment-action');
		item.closest('details')!.before(button);

		// Hide `Edit` from dropdown
		item.hidden = true;
		if (
			item.matches(':last-child') &&
			item.previousElementSibling?.matches('.dropdown-divider')
		) {
			item.previousElementSibling.remove();
		} else if (
			item.previousElementSibling?.matches('.dropdown-divider') &&
			item.nextElementSibling?.matches('.dropdown-divider')
		) {
			item.nextElementSibling.remove();
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Moves the `Edit comment` button out of the `...` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png'
}, {
	include: [
		pageDetect.hasComments
	],
	init
});
