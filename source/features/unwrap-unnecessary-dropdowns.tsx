import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

// Replace dropdown while keeping its sizing/positioning classes
function replaceDropdownInPlace(dropdown: Element, form: Element): void {
	dropdown.replaceWith(form);
	form.classList.add(...dropdown.classList);
	form.classList.remove('dropdown', 'details-reset', 'details-overlay');
}

async function unwrapNotifications(): Promise<void | false> {
	await elementReady('.js-check-all-container > :first-child'); // Ensure the entire dropdown has loaded
	const forms = select.all('[action="/notifications/beta/update_view_preference"]');
	if (forms.length === 0) {
		return false;
	}

	if (forms.length > 2) {
		throw new Error('GitHub added new view types. This feature is obsolete.');
	}

	const dropdown = forms[0].closest('details')!;
	const currentView = select('summary i', dropdown)!.nextSibling!.textContent!.trim();
	const desiredForm = currentView === 'Date' ? forms[0] : forms[1];

	// Replace dropdown
	replaceDropdownInPlace(dropdown, desiredForm);

	// Fix button’s style
	const button = select('[type="submit"]', desiredForm)!;
	button.className = 'btn';
	button.textContent = `Group by ${button.textContent!.toLowerCase()}`;
}

async function unwrapActionRun(): Promise<void | false> {
	const desiredForm = await elementReady('.js-check-suite-rerequest-form', {waitForChildren: false});
	if (!desiredForm) {
		return false;
	}

	const availableOptions = desiredForm
		.closest('.dropdown-menu')!
		.querySelectorAll('li > *'); // GitHub left an empty `li` in there 😒
	if (availableOptions.length > 1) {
		throw new Error('GitHub added items to the dropdown. This feature is obsolete.');
	}

	// Fix button’s style
	const button = select('button', desiredForm)!;
	button.className = 'btn';
	button.prepend(select('.octicon-sync')!);

	// Replace dropdown
	const dropdown = desiredForm.closest('details')!;
	replaceDropdownInPlace(dropdown, desiredForm);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	awaitDomReady: false,
	init: unwrapNotifications,
}, {
	include: [
		pageDetect.isActionRun,
	],
	awaitDomReady: false,
	init: unwrapActionRun,
});
