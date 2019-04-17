import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

function init() {
	const menuItems = select.all('details .js-comment-edit-button:not(.rgh-edit-comment)');

	for (const item of menuItems) {
		item.classList.add('rgh-edit-comment');

		const button = item.cloneNode() as HTMLButtonElement;
		button.append(icons.edit());
		button.classList.replace('dropdown-item', 'timeline-comment-action');
		item.closest('details')!.before(button);
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
