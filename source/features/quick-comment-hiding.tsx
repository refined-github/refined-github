import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function generateSubmenu(hideButton: Element): void {
	if (hideButton.closest('.rgh-quick-comment-hiding-details')) {
		// Already generated
		return;
	}

	const detailsElement = hideButton.closest('details')!;
	detailsElement.classList.add('rgh-quick-comment-hiding-details');

	const comment = hideButton.closest('.unminimized-comment')!;
	const hideCommentForm = select('.js-comment-minimize', comment)!;

	hideCommentForm.classList.remove('d-flex');

	// Generate dropdown items
	for (const reason of select.all('[name="classifier"] option:not([value=""])', comment)) {
		hideCommentForm.append(
			<button
				type="submit"
				name="classifier"
				value={reason.value}
				className="dropdown-item btn-link"
				role="menuitem"
			>
				{reason.textContent}
			</button>,
		);
	}

	// Drop previous form controls
	select('.btn', hideCommentForm)!.remove();
	select('[name="classifier"]', hideCommentForm)!.remove();

	// Close immediately after the clicking option
	hideCommentForm.addEventListener('click', () => {
		detailsElement.removeAttribute('open');
	});

	// Imitate existing menu
	hideCommentForm.classList.add('dropdown-menu', 'dropdown-menu-sw', 'color-text-primary', 'color-fg-default', 'show-more-popover', 'anim-scale-in');

	detailsElement.append(hideCommentForm);
}

// Shows menu on top of mainDropdownContent when "Hide" is clicked;
// Hide it when dropdown closes.
// Uses `v-hidden` to avoid conflicts with `close-out-of-view-modals`
function toggleSubMenu(hideButton: Element, show: boolean): void {
	const dropdown = hideButton.closest('details')!;

	// Native dropdown
	select('details-menu', dropdown)!.classList.toggle('v-hidden', show);

	// "Hide comment" dropdown
	select('form.js-comment-minimize', dropdown)!.classList.toggle('v-hidden', !show);
}

function resetDropdowns(event: DelegateEvent): void {
	toggleSubMenu(event.delegateTarget, false);
}

function showSubmenu(event: DelegateEvent): void {
	generateSubmenu(event.delegateTarget);
	toggleSubMenu(event.delegateTarget, true);

	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(signal: AbortSignal): void {
	// `capture: true` required to be fired before GitHub's handlers
	delegate(document, '.js-comment-hide-button', 'click', showSubmenu, {capture: true, signal});
	delegate(document, '.rgh-quick-comment-hiding-details', 'toggle', resetDropdowns, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
