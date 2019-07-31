import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

function init(): void {
	const menuItems = select.all('details .js-comment-edit-button:not(.rgh-edit-comment)');

	for (const item of menuItems) {
		item.classList.add('rgh-edit-comment');

		const button = item.cloneNode() as HTMLButtonElement;
		button.append(icons.edit());
		button.classList.replace('dropdown-item', 'timeline-comment-action');
		item.closest('details')!.before(button);

		// Hide `Edit` from dropdown
		item.hidden = true;
		if (
			item.matches(':last-child') &&
			item.previousElementSibling &&
			item.previousElementSibling.matches('.dropdown-divider')
		) {
			item.previousElementSibling.remove();
		} else if (
			item.previousElementSibling &&
			item.previousElementSibling.matches('.dropdown-divider') &&
			item.nextElementSibling &&
			item.nextElementSibling.matches('.dropdown-divider')
		) {
			item.nextElementSibling.remove();
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Moves the `Edit comment` button out of the `...` dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54864831-92372a00-4d97-11e9-8c29-efba2dde1baa.png',
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
