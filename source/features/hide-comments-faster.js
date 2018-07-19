import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';

function createMenu(hideButton) {
	const comment = hideButton.closest('.unminimized-comment');
	const form = select('.js-comment-minimize', comment);

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

	return (
		<details class="details-overlay details-reset position-relative d-inline-block js-dropdown-details d-none">
			<summary class="btn-link timeline-comment-action" aria-haspopup="true">
				{icons.fold()}
			</summary>
			<div class="dropdown-menu dropdown-menu-sw text-gray-dark show-more-popover anim-scale-in">{form}</div>
		</details>
	);
}

export default function () {
	for (const hideButton of select.all('.unminimized-comment .js-comment-hide-button')) {
		const menu = createMenu(hideButton);
		hideButton.closest('.timeline-comment-actions').append(menu);
		hideButton.classList.remove('js-comment-hide-button');
		hideButton.addEventListener('click', () => {
			hideButton.closest('details').open = false;
			menu.classList.remove('d-none');
			menu.open = true;
		});
	}
}
