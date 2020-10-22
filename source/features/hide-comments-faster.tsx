import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function generateSubmenu(hideButton: Element): void {
	if (hideButton.closest('.rgh-hide-comments-faster-details')) {
		// Already generated
		return;
	}

	const detailsElement = hideButton.closest('details')!;
	detailsElement.classList.add('rgh-hide-comments-faster-details');

	const comment = hideButton.closest('.unminimized-comment')!;
	const hideCommentForm = select('.js-comment-minimize', comment)!;

	// Generate dropdown items
	for (const reason of select.all<HTMLInputElement>('[name="classifier"] :not([value=""])', comment)) {
		hideCommentForm.append(
			<button
				type="submit"
				name="classifier"
				value={reason.value}
				className="dropdown-item btn-link"
				role="menuitem"
			>
				{reason.textContent}
			</button>
		);
	}

	// Drop previous form controls
	select('.btn', hideCommentForm)!.remove();
	select('[name="classifier"]', hideCommentForm)!.remove();

	// Imitate existing menu
	hideCommentForm.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');

	detailsElement.append(hideCommentForm);
}

// Shows menu on top of mainDropdownContent when "Hide" is clicked;
// Hide it when dropdown closes.
// Uses `v-hidden` and `d-none` to avoid conflicts with `close-out-of-view-modals`
function toggleSubMenu(hideButton: Element, show: boolean): void {
	const dropdown = hideButton.closest('details')!;

	// Native dropdown
	select('details-menu', dropdown)!.classList.toggle('v-hidden', show);

	// "Hide comment" dropdown
	select('form.js-comment-minimize', dropdown)!.classList.toggle('d-none', !show);
}

function resetDropdowns(event: delegate.Event): void {
	toggleSubMenu(event.delegateTarget, false);
}

function showSubmenu(event: delegate.Event): void {
	generateSubmenu(event.delegateTarget);
	toggleSubMenu(event.delegateTarget, true);

	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate(document, '.js-comment-hide-button', 'click', showSubmenu, true);
	delegate(document, '.rgh-hide-comments-faster-details', 'toggle', resetDropdowns, true);
}

void features.add(__filebasename, {}, {
	include: [
		pageDetect.hasComments
	],
	init
});
