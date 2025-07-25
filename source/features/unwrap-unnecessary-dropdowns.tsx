import {$, $$} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

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

	const dropdown = forms[0].closest('action-menu')!;
	const currentView = $('.Button-label span:last-child', dropdown).textContent.trim();
	const desiredForm = currentView === 'Date' ? forms[0] : forms[1];

	// Replace dropdown
	replaceDropdownInPlace(dropdown, desiredForm);

	// Fix button’s style
	const button = $('[type="submit"]', desiredForm);
	button.className = 'btn';
	button.textContent = `Group by ${button.textContent.toLowerCase()}`;
}

function replaceRerunDropdown(menu: Element): void {
	const triggerButton = $('focus-group > button', menu);

	// We only need to unwrap the re-run jobs menu
	if (triggerButton.textContent.trim() !== 'Re-run jobs') {
		return;
	}

	const container = menu.parentElement!;
	container.classList.add('d-flex', 'gap-2');

	for (const button of $$('button.ActionListContent', menu)) {
		button.className = 'Button--secondary Button--medium Button';
		container.append(button.cloneNode(true));
	}

	menu.classList.add('d-none');
}

function unwrapRerunActions(signal: AbortSignal): void {
	observe('.PageHeader-actions action-menu', replaceRerunDropdown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	deduplicate: 'has-rgh',
	init: unwrapNotifications,
}, {
	include: [
		pageDetect.isActionRun,
	],
	init: unwrapRerunActions,
});

/*

Test URLs:
https://github.com/notifications

*/
