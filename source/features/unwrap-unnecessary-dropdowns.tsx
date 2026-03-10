import {$, $$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// Replace dropdown while keeping its sizing/positioning classes
function replaceDropdownInPlace(dropdown: Element, form: Element): void {
	dropdown.replaceWith(form);
	form.classList.add(...dropdown.classList);
	form.classList.remove('dropdown', 'details-reset', 'details-overlay');
}

function replaceNotificationsDropdown(): void {
	const forms = $$optional('[action="/notifications/beta/update_view_preference"]');

	if (forms.length === 0) {
		return;
	}

	if (forms.length > 2) {
		throw new Error('GitHub added new view types. This feature is obsolete.');
	}

	const dropdown = forms[0].closest('action-menu')!;
	const currentView = $('.Button-label span:last-child', dropdown).textContent.trim();
	const desiredForm = currentView === 'Date' ? forms[0] : forms[1];

	// Replace dropdown
	replaceDropdownInPlace(dropdown, desiredForm);

	// Fix button's style
	const button = $('[type="submit"]', desiredForm);
	button.className = 'btn';
	button.textContent = `Group by ${button.textContent.toLowerCase()}`;
}

function init(signal: AbortSignal): void {
	observe('.js-check-all-container > :first-child', replaceNotificationsDropdown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URLs:

- https://github.com/notifications

*/
