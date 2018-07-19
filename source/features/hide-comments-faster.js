import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';

function createMenu(hideButton) {
	const comment = hideButton.closest('.unminimized-comment');
	const form = select('.js-comment-minimize', comment);
	const reasons = select('[name="classifier"]', comment);

	// Drop submit button
	select('button', form).remove();

	// Generate dropdown items
	for (const reason of reasons.options) {
		if (reason.value) {
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
	}

	form.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');
	reasons.remove();
	const menu = (
		<details class="rgh-hide-comment-menu details-overlay details-reset position-relative d-inline-block js-dropdown-details d-none">
			<summary class="btn-link timeline-comment-action" aria-haspopup="true">
				{icons.fold()}
			</summary>
			{form}
		</details>
	);
	select('.timeline-comment-actions', comment).append(menu);
	return menu;
}

export default function () {
	for (const hideButton of select.all('.unminimized-comment .js-comment-hide-button')) {
		const menu = createMenu(hideButton);
		hideButton.classList.remove('js-comment-hide-button');
		hideButton.addEventListener('click', () => {
			menu.classList.remove('d-none');
			menu.open = true;
		});
	}
}
