import {React} from 'dom-chef/react';
import select from 'select-dom';
import delegate from 'delegate';
import features from '../libs/features';

function handleMenuOpening(event) {
	const hideButton = select('.js-comment-hide-button', event.delegateTarget.parentElement);
	if (!hideButton) {
		// User unable to hide or menu already created
		return;
	}

	// Disable default behavior
	hideButton.classList.remove('js-comment-hide-button');

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

	// Imitate existing menu
	form.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');

	// Show menu on top of optionList when "Hide" is clicked
	// Hide it when dropdown closes
	const dropdown = hideButton.closest('details');
	const optionList = select('.show-more-popover', dropdown);
	hideButton.addEventListener('click', () => {
		optionList.setAttribute('hidden', true);
		form.removeAttribute('hidden');
	});
	dropdown.addEventListener('toggle', () => {
		optionList.removeAttribute('hidden');
		form.setAttribute('hidden', true);
	});

	dropdown.append(form);
}

function init() {
	delegate('summary[aria-label="Show options"]', 'click', handleMenuOpening);
}

features.add({
	id: 'hide-comments-faster',
	include: [
		features.isPR,
		features.isIssue,
		features.isCommit,
		features.isDiscussion
	],
	load: features.onDomReady,
	init
});
