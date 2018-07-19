import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {onDeferredComments} from '../libs/events';

function createMenu(hideButton) {
	const comment = hideButton.closest('.unminimized-comment');
	const form = select('.js-comment-minimize', comment);
	const details = hideButton.closest('details');

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

	// Imitate existing menu
	form.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');
	details.append(form);

	// Hide this menu when the existing menu closes
	details.addEventListener('toggle', () => {
		form.hidden = true;
	});
	return form;
}

function createMenus() {
	for (const hideButton of select.all('.unminimized-comment .js-comment-hide-button')) {
		hideButton.classList.remove('js-comment-hide-button'); // Disable default behavior

		// The menu will be generated on the first click.
		// On successive clicks it will just be shown
		const getMenu = onetime(() => createMenu(hideButton));
		hideButton.addEventListener('click', () => {
			getMenu().hidden = false;
		});
	}
}

export default function () {
	onDeferredComments(createMenus);
	createMenus();
}
