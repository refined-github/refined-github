import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

// Replace dropdown while keeping its sizing/positioning classes
function replaceDropdownInPlace(dropdown: Element, form: Element): void {
	dropdown.replaceWith(form);
	form.classList.add(...dropdown.classList);
	form.classList.remove('dropdown', 'details-reset', 'details-overlay');
}

async function unwrapNotifications(): Promise<void | false> {
	await elementReady('.js-check-all-container > :nth-child(2)'); // Wait for filters to be ready
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

async function unwrapActionJobRun(): Promise<void | false> {
	const desiredForm = await elementReady('.js-check-suite-rerequest-form');
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
	button.className = 'btn btn-sm';
	button.prepend(select('.octicon-sync')!);

	// Replace dropdown
	const dropdown = desiredForm.closest('details')!;
	replaceDropdownInPlace(dropdown, desiredForm);
}

features.add({
	id: __filebasename,
	description: 'Makes some dropdowns 1-click instead of unnecessarily 2-click.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80859624-9bfdb300-8c62-11ea-837f-7b7a28e6fdfc.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	waitForDomReady: false,
	init: unwrapNotifications
}, {
	include: [
		pageDetect.isActionJobRun
	],
	waitForDomReady: false,
	init: unwrapActionJobRun
});
