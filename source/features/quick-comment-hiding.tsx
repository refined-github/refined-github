import React from 'dom-chef';
import {$, $$} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const formSelector = [
	'form[action$="/minimize-comment"]',
	'form[action$="/minimize"]', // Review thread comments
];

function generateSubmenu(hideButton: Element): void {
	if (hideButton.closest('.rgh-quick-comment-hiding-details')) {
		// Already generated
		return;
	}

	const detailsElement = hideButton.closest('details')!;
	detailsElement.classList.add('rgh-quick-comment-hiding-details');

	const comment = hideButton.closest('.unminimized-comment')!;
	const hideCommentForm: HTMLFormElement = $(formSelector, comment)!;

	// Generate dropdown
	const newForm = hideCommentForm.cloneNode();
	const fields = [...hideCommentForm.elements].map(field => field.cloneNode());
	newForm.append(<i hidden>{fields}</i>); // Add existing fields (comment ID, token)
	newForm.setAttribute('novalidate', 'true');	// Ignore the form's required attributes

	// Imitate existing menu, reset classes
	newForm.className = ['dropdown-menu', 'dropdown-menu-sw', 'color-fg-default', 'show-more-popover', 'anim-scale-in'].join(' ');

	for (const reason of $$('option:not([value=""])', hideCommentForm.elements.classifier)) {
		newForm.append(
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

	// Close immediately after the clicking option
	newForm.addEventListener('click', () => {
		detailsElement.open = false;
	});

	detailsElement.append(newForm);
}

// Shows menu on top of mainDropdownContent when "Hide" is clicked;
// Hide it when dropdown closes.
// Uses `v-hidden` to avoid conflicts with `close-out-of-view-modals`
function toggleSubMenu(hideButton: Element, show: boolean): void {
	const dropdown = hideButton.closest('details')!;

	// Native dropdown
	$('details-menu', dropdown)!.classList.toggle('v-hidden', show);

	// "Hide comment" dropdown
	$(formSelector, dropdown)!.classList.toggle('v-hidden', !show);
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
	delegate('.js-comment-hide-button', 'click', showSubmenu, {capture: true, signal});
	delegate('.rgh-quick-comment-hiding-details', 'toggle', resetDropdowns, {capture: true, signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasComments,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/47

*/
