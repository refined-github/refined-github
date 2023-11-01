import {$, $$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

// Replace dropdown while keeping its sizing/positioning classes
function replaceDropdownInPlace(dropdown: Element, form: Element): void {
	dropdown.replaceWith(form);
	form.classList.add(...dropdown.classList);
	form.classList.remove('dropdown', 'details-reset', 'details-overlay');
}

async function unwrapNotifications(): Promise<void | false> {
	await elementReady('.js-check-all-container > :first-child'); // Ensure the entire dropdown has loaded
	const forms = $$('[action="/notifications/beta/update_view_preference"]');
	if (forms.length === 0) {
		return false;
	}

	if (forms.length > 2) {
		throw new Error('GitHub added new view types. This feature is obsolete.');
	}

	const dropdown = forms[0].closest('details')!;
	const currentView = $('summary i', dropdown)!.nextSibling!.textContent.trim();
	const desiredForm = currentView === 'Date' ? forms[0] : forms[1];

	// Replace dropdown
	replaceDropdownInPlace(dropdown, desiredForm);

	// Fix button’s style
	const button = $('[type="submit"]', desiredForm)!;
	button.className = 'btn';
	button.textContent = `Group by ${button.textContent.toLowerCase()}`;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	deduplicate: 'has-rgh',
	init: unwrapNotifications,
});
