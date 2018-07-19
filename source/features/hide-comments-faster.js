import {h} from 'dom-chef';
import select from 'select-dom';
import {onDeferredComments} from '../libs/events';

function createMenu(hideButton) {
	const comment = hideButton.closest('.unminimized-comment');
	const form = select('.js-comment-minimize', comment);
	form.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');
	form.hidden = true;

	// Generate dropdown items
	for (const reason of select.all('[name="classifier"] :not([value=""])', comment)) {
		form.append(
			<button
				name="classifier"
				value={reason.value}
				class="dropdown-item btn-link"
				role="menuitem">
				{reason.textContent}
			</button>
		);
	}

	// Drop previous form controls
	select('.btn', form).remove();
	select('[name="classifier"]', form).remove();

	return form;
}

function createMenus() {
	for (const hideButton of select.all('.unminimized-comment .js-comment-hide-button')) {
		const menu = createMenu(hideButton);
		hideButton.closest('.dropdown-menu').after(menu);
		hideButton.classList.remove('js-comment-hide-button');
		hideButton.addEventListener('click', () => {
			menu.hidden = false;
		});
		hideButton.closest('details').addEventListener('toggle', () => {
			menu.hidden = true;
		});
	}
}

export default function () {
	onDeferredComments(createMenus);
	createMenus();
}
