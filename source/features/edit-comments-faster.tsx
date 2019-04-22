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
	id: 'edit-comments-faster',
	include: [
		features.hasComments
	],
	load: features.onNewComments,
	init
});
