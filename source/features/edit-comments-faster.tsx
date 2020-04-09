import select from 'select-dom';
import pencilIcon from 'octicon/pencil.svg';
import features from '../libs/features';

function init(): void {
	const menuItems = select.all('details .js-comment-edit-button:not(.rgh-edit-comment)');

	for (const item of menuItems) {
		item.classList.add('rgh-edit-comment');

		const button = item.cloneNode();
		button.append(pencilIcon());
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
	id: __featureName__,
	description: 'Moves the `Edit comment` button out of the `...` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png'
}, {
	include: [
		features.hasComments
	],
	init
});
