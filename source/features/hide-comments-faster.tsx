import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function handleMenuOpening(event: DelegateEvent) {
	const hideButton = select('.js-comment-hide-button', event.delegateTarget.parentElement!);
	if (!hideButton) {
		// User unable to hide or menu already created
		return;
	}

	// Disable default behavior
	hideButton.classList.remove('js-comment-hide-button');

	const comment = hideButton.closest('.unminimized-comment')!;
	const form = select('.js-comment-minimize', comment)!;

	// Generate dropdown items
	for (const reason of select.all<HTMLInputElement>('[name="classifier"] :not([value=""])', comment)) {
		form.append(
			<button
				name="classifier"
				value={reason.value}
				className="dropdown-item btn-link"
				role="menuitem">
				{reason.textContent}
			</button>
		);
	}

	// Drop previous form controls
	select('.btn', form)!.remove();
	select('[name="classifier"]', form)!.remove();

	// Imitate existing menu
	form.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');

	// Show menu on top of optionList when "Hide" is clicked
	// Hide it when dropdown closes.
	// Uses `v-hidden` and `d-none` to avoid conflicts with `close-out-of-view-modals`
	const dropdown = hideButton.closest('details')!;
	const optionList = select('.show-more-popover', dropdown)!;
	hideButton.addEventListener('click', event => {
		event.stopImmediatePropagation();
		event.preventDefault();
		optionList.classList.add('v-hidden');
		form.classList.remove('d-none');
	});
	dropdown.addEventListener('toggle', () => {
		optionList.classList.remove('v-hidden');
		form.classList.add('d-none');
	});

	dropdown.append(form);
}

function init() {
	delegate('.timeline-comment-action', 'click', handleMenuOpening);
}

features.add({
	id: 'hide-comments-faster',
	include: [
		features.isPR,
		features.isIssue,
		features.isCommit,
		features.isDiscussion
	],
	load: features.onAjaxedPages,
	init
});
